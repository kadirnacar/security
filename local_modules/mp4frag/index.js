'use strict';

const { Transform } = require('stream');

const _FTYP = Buffer.from([0x66, 0x74, 0x79, 0x70]); // ftyp
const _MOOV = Buffer.from([0x6d, 0x6f, 0x6f, 0x76]); // moov
const _MDHD = Buffer.from([0x6d, 0x64, 0x68, 0x64]); // mdhd
const _AVCC = Buffer.from([0x61, 0x76, 0x63, 0x43]); // avcC
const _MP4A = Buffer.from([0x6d, 0x70, 0x34, 0x61]); // mp4a
const _MOOF = Buffer.from([0x6d, 0x6f, 0x6f, 0x66]); // moof
const _MDAT = Buffer.from([0x6d, 0x64, 0x61, 0x74]); // mdat
const _TFHD = Buffer.from([0x74, 0x66, 0x68, 0x64]); // tfhd
const _TRUN = Buffer.from([0x74, 0x72, 0x75, 0x6e]); // trun
const _MFRA = Buffer.from([0x6d, 0x66, 0x72, 0x61]); // mfra
const _HLS_INIT_DEF = true; // hls playlist available after initialization and before 1st segment
const _HLS_SIZE_DEF = 4; // hls playlist size default
const _HLS_SIZE_MIN = 2; // hls playlist size minimum
const _HLS_SIZE_MAX = 20; // hls playlist size maximum
const _HLS_EXTRA_DEF = 0; // hls playlist extra segments in memory default
const _HLS_EXTRA_MIN = 0; // hls playlist extra segments in memory minimum
const _HLS_EXTRA_MAX = 10; // hls playlist extra segments in memory maximum
const _SEG_SIZE_DEF = 2; // segment list size default
const _SEG_SIZE_MIN = 2; // segment list size minimum
const _SEG_SIZE_MAX = 30; // segment list size maximum

/**
 * @fileOverview
 * <ul>
 * <li>Creates a stream transform for piping a fmp4 (fragmented mp4) from ffmpeg.</li>
 * <li>Can be used to generate a fmp4 m3u8 HLS playlist and compatible file fragments.</li>
 * <li>Can be used for storing past segments of the mp4 video in a buffer for later access.</li>
 * <li>Must use the following ffmpeg args <b><i>-movflags +frag_keyframe+empty_moov+default_base_moof</i></b> to generate
 * a valid fmp4 with a compatible file structure : ftyp+moov -> moof+mdat -> moof+mdat -> moof+mdat ...</li>
 * </ul>
 * @requires stream.Transform
 */
class Mp4Frag extends Transform {
  /**
   * @constructor
   * @param {Object} [options] - Configuration options.
   * @param {String} [options.hlsPlaylistBase] - Base name of files in m3u8 playlist. Affects the generated m3u8 playlist by naming file fragments. Must be set to generate m3u8 playlist. e.g. 'front_door'
   * @param {Number} [options.hlsPlaylistSize = 4] - Number of segments to use in m3u8 playlist. Must be an integer ranging from 2 to 20.
   * @param {Number} [options.hlsPlaylistExtra = 0] - Number of extra segments to keep in memory. Must be an integer ranging from 0 to 10.
   * @param {Boolean} [options.hlsPlaylistInit = true] - Indicates that m3u8 playlist should be generated after [initialization]{@link Mp4Frag#initialization} is created and before media segments are created.
   * @param {Number} [options.segmentCount = 2] - Number of segments to keep in memory. Has no effect if using options.hlsPlaylistBase. Must be an integer ranging from 2 to 30.
   * @returns {Mp4Frag} this - Returns reference to new instance of Mp4Frag for chaining event listeners.
   * @throws Will throw an error if options.hlsPlaylistBase contains characters other than letters(a-zA-Z) and underscores(_).
   */
  constructor(options) {
    super({ readableObjectMode: true });
    if (typeof options === 'object') {
      if (typeof options.hlsPlaylistBase !== 'undefined') {
        if (/[^a-z_]/gi.test(options.hlsPlaylistBase)) {
          throw new Error(
            'hlsPlaylistBase must only contain underscores and case-insensitive letters (_, a-z, A-Z)'
          );
        }
        this._hlsPlaylistBase = options.hlsPlaylistBase;
        this._hlsParentPath = options.hlsParentPath;
        this._hlsPlaylistInit = Mp4Frag._validateBoolean(
          options.hlsPlaylistInit,
          _HLS_INIT_DEF
        );
        this._hlsPlaylistSize = Mp4Frag._validateNumber(
          options.hlsPlaylistSize,
          _HLS_SIZE_DEF,
          _HLS_SIZE_MIN,
          _HLS_SIZE_MAX
        );
        this._hlsPlaylistExtra = Mp4Frag._validateNumber(
          options.hlsPlaylistExtra,
          _HLS_EXTRA_DEF,
          _HLS_EXTRA_MIN,
          _HLS_EXTRA_MAX
        );
        this._segmentCount = this._hlsPlaylistSize + this._hlsPlaylistExtra;
        this._segmentObjects = [];
      } else if (typeof options.segmentCount !== 'undefined') {
        this._segmentCount = Mp4Frag._validateNumber(
          options.segmentCount,
          _SEG_SIZE_DEF,
          _SEG_SIZE_MIN,
          _SEG_SIZE_MAX
        );
        this._segmentObjects = [];
      }
    }
    this._parseChunk = this._findFtyp;
    return this;
  }

  /**
   * @readonly
   * @property {String|null} audioCodec
   * - Returns the audio codec information as a <b>String</b>.
   * <br/>
   * - Returns <b>Null</b> if requested before [initialized event]{@link Mp4Frag#event:initialized}.
   * @returns {String|null}
   */
  get audioCodec() {
    return this._audioCodec || null;
  }

  /**
   * @readonly
   * @property {String|null} videoCodec
   * - Returns the video codec information as a <b>String</b>.
   * <br/>
   * - Returns <b>Null</b> if requested before [initialized event]{@link Mp4Frag#event:initialized}.
   * @returns {String|null}
   */
  get videoCodec() {
    return this._videoCodec || null;
  }

  /**
   * @readonly
   * @property {String|null} mime
   * - Returns the mime type information as a <b>String</b>.
   * <br/>
   * - Returns <b>Null</b> if requested before [initialized event]{@link Mp4Frag#event:initialized}.
   * @returns {String|null}
   */
  get mime() {
    return this._mime || null;
  }

  /**
   * @readonly
   * @property {Buffer|null} initialization
   * - Returns the Mp4 initialization fragment as a <b>Buffer</b>.
   * <br/>
   * - Returns <b>Null</b> if requested before [initialized event]{@link Mp4Frag#event:initialized}.
   * @returns {Buffer|null}
   */
  get initialization() {
    return this._initialization || null;
  }

  /**
   * @readonly
   * @property {Buffer|null} segment
   * - Returns the latest Mp4 segment as a <b>Buffer</b>.
   * <br/>
   * - Returns <b>Null</b> if requested before first [segment event]{@link Mp4Frag#event:segment}.
   * @returns {Buffer|null}
   */
  get segment() {
    return this._segment || null;
  }

  /**
   * @readonly
   * @property {Object} segmentObject
   * - Returns the latest Mp4 segment as an <b>Object</b>.
   * <br/>
   *  - <b><code>{segment, sequence, duration, timestamp, keyframe}</code></b>
   * <br/>
   * - Returns <b>{segment: null, sequence: -1, duration: -1; timestamp: -1, keyframe: -1}</b> if requested before first [segment event]{@link Mp4Frag#event:segment}.
   * @returns {Object}
   */
  get segmentObject() {
    return {
      segment: this.segment,
      sequence: this.sequence,
      duration: this.duration,
      timestamp: this.timestamp,
      keyframe: this.keyframe,
    };
  }

  /**
   * @readonly
   * @property {Number} timestamp
   * - Returns the timestamp of the latest Mp4 segment as an <b>Integer</b>(<i>milliseconds</i>).
   * <br/>
   * - Returns <b>-1</b> if requested before first [segment event]{@link Mp4Frag#event:segment}.
   * @returns {Number}
   */
  get timestamp() {
    return this._timestamp || -1;
  }

  /**
   * @readonly
   * @property {Number} duration
   * - Returns the duration of latest Mp4 segment as a <b>Float</b>(<i>seconds</i>).
   * <br/>
   * - Returns <b>-1</b> if requested before first [segment event]{@link Mp4Frag#event:segment}.
   * @returns {Number}
   */
  get duration() {
    return this._duration || -1;
  }

  /**
   * @readonly
   * @property {Number} totalDuration
   * - Returns the total duration of all Mp4 segments as a <b>Float</b>(<i>seconds</i>).
   * <br/>
   * - Returns <b>-1</b> if requested before first [segment event]{@link Mp4Frag#event:segment}.
   * @returns {Number}
   */
  get totalDuration() {
    return this._totalDuration || -1;
  }

  /**
   * @readonly
   * @property {Number} totalByteLength
   * - Returns the total byte length of the Mp4 initialization and all Mp4 segments as ant <b>Int</b>(<i>bytes</i>).
   * <br/>
   * - Returns <b>-1</b> if requested before [initialized event]{@link Mp4Frag#event:initialized}.
   * @returns {Number}
   */
  get totalByteLength() {
    return this._totalByteLength || -1;
  }

  /**
   * @readonly
   * @property {String|null} m3u8
   * - Returns the fmp4 HLS m3u8 playlist as a <b>String</b>.
   * <br/>
   * - Returns <b>Null</b> if requested before [initialized event]{@link Mp4Frag#event:initialized}.
   * @returns {String|null}
   */
  get m3u8() {
    return this._m3u8 || null;
  }

  /**
   * @readonly
   * @property {Number} sequence
   * - Returns the sequence of the latest Mp4 segment as an <b>Integer</b>.
   * <br/>
   * - Returns <b>-1</b> if requested before first [segment event]{@link Mp4Frag#event:segment}.
   * @returns {Number}
   */
  get sequence() {
    return Number.isInteger(this._sequence) ? this._sequence : -1;
  }

  /**
   * @readonly
   * @property {Number} keyframe
   * - Returns the nal keyframe index of the latest Mp4 segment as an <b>Integer</b>.
   * <br/>
   * - Returns <b>-1</b> if segment contains no keyframe nal.
   * @returns {Number}
   */
  get keyframe() {
    return Number.isInteger(this._keyframe) ? this._keyframe : -1;
  }

  /**
   * @readonly
   * @property {boolean} allKeyframes
   * - Returns a boolean indicating if all segments contain a keyframe.
   * <br/>
   * - Returns <b>false</b> if any segments do not contain a keyframe.
   * @returns {boolean}
   */
  get allKeyframes() {
    return typeof this._allKeyframes === 'boolean' ? this._allKeyframes : true;
  }

  /**
   * @readonly
   * @property {Array|null} segmentObjects
   * - Returns the Mp4 segments as an <b>Array</b> of <b>Objects</b>
   * <br/>
   * - <b><code>[{segment, sequence, duration, timestamp, keyframe},...]</code></b>
   * <br/>
   * - Returns <b>Null</b> if requested before first [segment event]{@link Mp4Frag#event:segment}.
   * @returns {Array|null}
   */
  get segmentObjects() {
    return this._segmentObjects && this._segmentObjects.length
      ? this._segmentObjects
      : null;
  }

  /**
   * @param {Number|String} sequence - sequence number
   * @returns {Object|null}
   * - Returns the Mp4 segment that corresponds to the numbered sequence as an <b>Object</b>.
   * <br/>
   * - <b><code>{segment, sequence, duration, timestamp, keyframe}</code></b>
   * <br/>
   * - Returns <b>Null</b> if there is no segment that corresponds to sequence number.
   */
  getSegmentObject(sequence) {
    sequence = Number.parseInt(sequence);
    if (this._segmentObjects && this._segmentObjects.length) {
      return (
        this._segmentObjects[
          this._segmentObjects.length - 1 - (this._sequence - sequence)
        ] || null
      );
    }
    return null;
  }

  /**
   * Clear cached values
   */
  resetCache() {
    /**
     * Fires when resetCache() is called.
     * @event Mp4Frag#reset
     * @type {Event}
     */
    this.emit('reset');
    this._parseChunk = this._findFtyp;
    if (this._segmentObjects) {
      this._segmentObjects = [];
    }
    this._timescale = undefined;
    this._sequence = undefined;
    this._allKeyframes = undefined;
    this._mime = undefined;
    this._videoCodec = undefined;
    this._audioCodec = undefined;
    this._initialization = undefined;
    this._segment = undefined;
    this._timestamp = undefined;
    this._duration = undefined;
    this._totalDuration = undefined;
    this._totalByteLength = undefined;
    this._moof = undefined;
    this._mdatBuffer = undefined;
    this._moofLength = undefined;
    this._mdatLength = undefined;
    this._mdatBufferSize = undefined;
    this._ftyp = undefined;
    this._ftypLength = undefined;
    this._m3u8 = undefined;
  }

  /**
   * Search buffer for ftyp.
   * @private
   */
  _findFtyp(chunk) {
    const chunkLength = chunk.length;
    if (chunkLength < 8 || chunk.indexOf(_FTYP) !== 4) {
      this.emit('error', new Error(`${_FTYP.toString()} not found.`));
      return;
    }
    this._ftypLength = chunk.readUInt32BE(0);
    if (this._ftypLength < chunkLength) {
      this._ftyp = chunk.slice(0, this._ftypLength);
      this._parseChunk = this._findMoov;
      this._parseChunk(chunk.slice(this._ftypLength));
    } else if (this._ftypLength === chunkLength) {
      this._ftyp = chunk;
      this._parseChunk = this._findMoov;
    } else {
      //should not be possible to get here because ftyp is approximately 24 bytes
      //will have to buffer this chunk and wait for rest of it on next pass
      this.emit(
        'error',
        new Error(`ftypLength:${this._ftypLength} > chunkLength:${chunkLength}`)
      );
      //return;
    }
  }

  /**
   * Search buffer for moov.
   * @private
   */
  _findMoov(chunk) {
    const chunkLength = chunk.length;
    if (chunkLength < 8 || chunk.indexOf(_MOOV) !== 4) {
      this.emit('error', new Error(`${_MOOV.toString()} not found.`));
      return;
    }
    const moovLength = chunk.readUInt32BE(0);
    if (moovLength < chunkLength) {
      this._initialize(
        Buffer.concat([this._ftyp, chunk], this._ftypLength + moovLength)
      );
      this._ftyp = undefined;
      this._ftypLength = undefined;
      this._parseChunk = this._findMoof;
      this._parseChunk(chunk.slice(moovLength));
    } else if (moovLength === chunkLength) {
      this._initialize(
        Buffer.concat([this._ftyp, chunk], this._ftypLength + moovLength)
      );
      this._ftyp = undefined;
      this._ftypLength = undefined;
      this._parseChunk = this._findMoof;
    } else {
      //probably should not arrive here here because moov is typically < 800 bytes
      //will have to store chunk until size is big enough to have entire moov piece
      //ffmpeg may have crashed before it could output moov and got us here
      this.emit(
        'error',
        new Error(`moovLength:${moovLength} > chunkLength:${chunkLength}`)
      );
      //return;
    }
  }

  /**
   * Parse moov for mime.
   * @fires Mp4Frag#initialized
   * @private
   */
  _initialize(value) {
    this._initialization = value;
    const mdhdIndex = this._initialization.indexOf(_MDHD);
    const mdhdVersion = this._initialization[mdhdIndex + 4];
    this._timescale = this._initialization.readUInt32BE(
      mdhdIndex + (mdhdVersion === 0 ? 16 : 24)
    );
    this._timestamp = Date.now();
    this._sequence = -1;
    this._allKeyframes = true;
    this._totalDuration = 0;
    this._totalByteLength = this._initialization.byteLength;
    const videoCodecIndex = this._initialization.indexOf(_AVCC);
    const audioCodecIndex = this._initialization.indexOf(_MP4A);
    const codecs = [];
    if (videoCodecIndex !== -1) {
      // todo check for other types of video codecs
      this._videoCodec = `avc1.${this._initialization
        .slice(videoCodecIndex + 5, videoCodecIndex + 8)
        .toString('hex')
        .toUpperCase()}`;
      codecs.push(this._videoCodec);
    }
    if (audioCodecIndex !== -1) {
      // todo check for other types of audio codecs
      this._audioCodec = 'mp4a.40.2';
      codecs.push(this._audioCodec);
    }
    if (codecs.length === 0) {
      this.emit('error', new Error(`codecs not found.`));
      return;
    }
    this._mime = `${
      this.videoCodec !== null ? 'video' : 'audio'
    }/mp4; codecs="${codecs.join(', ')}"`;
    if (this._hlsPlaylistBase && this._hlsPlaylistInit) {
      let m3u8 = '#EXTM3U\n';
      m3u8 += '#EXT-X-VERSION:7\n';
      m3u8 += `#EXT-X-TARGETDURATION:1\n`;
      m3u8 += `#EXT-X-MEDIA-SEQUENCE:0\n`;
      m3u8 += `#EXT-X-MAP:URI="${
        this._hlsParentPath ? this._hlsParentPath + '/' : ''
      }${this._hlsPlaylistBase}.mp4"\n`;
      this._m3u8 = m3u8;
    }
    /**
     * Fires when the [initialization]{@link Mp4Frag#initialization} of the Mp4 is parsed from the piped data.
     * @event Mp4Frag#initialized
     * @type {Event}
     * @property {Object} Object
     * @property {String} Object.mime - [Mp4Frag.mime]{@link Mp4Frag#mime}
     * @property {Buffer} Object.initialization - [Mp4Frag.initialization]{@link Mp4Frag#initialization}
     * @property {String} Object.m3u8 - [Mp4Frag.m3u8]{@link Mp4Frag#m3u8}
     */
    this.emit('initialized', {
      mime: this.mime,
      initialization: this.initialization,
      m3u8: this.m3u8,
    });
  }

  /**
   * Find moof after miss due to corrupt data in pipe.
   * @private
   */
  _moofHunt(chunk) {
    if (this._moofHunts < this._moofHuntsLimit) {
      this._moofHunts++;
      //console.warn(`MOOF hunt attempt number ${this._moofHunts}.`);
      const index = chunk.indexOf(_MOOF);
      if (index > 3 && chunk.length > index + 3) {
        this._moofHunts = undefined;
        this._moofHuntsLimit = undefined;
        this._parseChunk = this._findMoof;
        this._parseChunk(chunk.slice(index - 4));
      }
    } else {
      this.emit(
        'error',
        new Error(
          `${_MOOF.toString()} hunt failed after ${this._moofHunts} attempts.`
        )
      );
      //return;
    }
  }

  /**
   * Search buffer for moof.
   * @private
   */
  _findMoof(chunk) {
    if (this._moofBuffer) {
      this._moofBuffer.push(chunk);
      const chunkLength = chunk.length;
      this._moofBufferSize += chunkLength;
      if (this._moofLength === this._moofBufferSize) {
        //todo verify this works
        this._moof = Buffer.concat(this._moofBuffer, this._moofLength);
        this._moofBuffer = undefined;
        this._moofBufferSize = undefined;
        this._parseChunk = this._findMdat;
      } else if (this._moofLength < this._moofBufferSize) {
        this._moof = Buffer.concat(this._moofBuffer, this._moofLength);
        const sliceIndex =
          chunkLength - (this._moofBufferSize - this._moofLength);
        this._moofBuffer = undefined;
        this._moofBufferSize = undefined;
        this._parseChunk = this._findMdat;
        this._parseChunk(chunk.slice(sliceIndex));
      }
    } else {
      const chunkLength = chunk.length;
      if (chunkLength < 8 || chunk.indexOf(_MOOF) !== 4) {
        //ffmpeg occasionally pipes corrupt data, lets try to get back to normal if we can find next MOOF box before attempts run out
        const mfraIndex = chunk.indexOf(_MFRA);
        if (mfraIndex !== -1) {
          //console.log(`MFRA was found at ${mfraIndex}. This is expected at the end of stream.`);
          return;
        }
        //console.warn('Failed to find MOOF. Starting MOOF hunt. Ignore this if your file stream input has ended.');
        this._moofHunts = 0;
        this._moofHuntsLimit = 40;
        this._parseChunk = this._moofHunt;
        this._parseChunk(chunk);
        return;
      }
      this._moofLength = chunk.readUInt32BE(0);
      if (this._moofLength === 0) {
        this.emit(
          'error',
          new Error(
            `Bad data from input stream reports ${_MOOF.toString()} length of 0.`
          )
        );
        return;
      }
      if (this._moofLength < chunkLength) {
        this._moof = chunk.slice(0, this._moofLength);
        this._parseChunk = this._findMdat;
        this._parseChunk(chunk.slice(this._moofLength));
      } else if (this._moofLength === chunkLength) {
        //todo verify this works
        this._moof = chunk;
        this._parseChunk = this._findMdat;
      } else {
        this._moofBuffer = [chunk];
        this._moofBufferSize = chunkLength;
      }
    }
  }

  /**
   * Search buffer for mdat.
   * @private
   */
  _findMdat(chunk) {
    if (this._mdatBuffer) {
      this._mdatBuffer.push(chunk);
      const chunkLength = chunk.length;
      this._mdatBufferSize += chunkLength;
      if (this._mdatLength === this._mdatBufferSize) {
        this._setSegment(
          Buffer.concat(
            [this._moof, ...this._mdatBuffer],
            this._moofLength + this._mdatLength
          )
        );
        this._moof = undefined;
        this._mdatBuffer = undefined;
        this._mdatBufferSize = undefined;
        this._mdatLength = undefined;
        this._moofLength = undefined;
        this._parseChunk = this._findMoof;
      } else if (this._mdatLength < this._mdatBufferSize) {
        this._setSegment(
          Buffer.concat(
            [this._moof, ...this._mdatBuffer],
            this._moofLength + this._mdatLength
          )
        );
        const sliceIndex =
          chunkLength - (this._mdatBufferSize - this._mdatLength);
        this._moof = undefined;
        this._mdatBuffer = undefined;
        this._mdatBufferSize = undefined;
        this._mdatLength = undefined;
        this._moofLength = undefined;
        this._parseChunk = this._findMoof;
        this._parseChunk(chunk.slice(sliceIndex));
      }
    } else {
      const chunkLength = chunk.length;
      if (chunkLength < 8 || chunk.indexOf(_MDAT) !== 4) {
        this.emit('error', new Error(`${_MDAT.toString()} not found.`));
        return;
      }
      this._mdatLength = chunk.readUInt32BE(0);
      if (this._mdatLength > chunkLength) {
        this._mdatBuffer = [chunk];
        this._mdatBufferSize = chunkLength;
      } else if (this._mdatLength === chunkLength) {
        this._setSegment(
          Buffer.concat([this._moof, chunk], this._moofLength + chunkLength)
        );
        this._moof = undefined;
        this._moofLength = undefined;
        this._mdatLength = undefined;
        this._parseChunk = this._findMoof;
      } else {
        this._setSegment(
          Buffer.concat(
            [this._moof, chunk],
            this._moofLength + this._mdatLength
          )
        );
        const sliceIndex = this._mdatLength;
        this._moof = undefined;
        this._moofLength = undefined;
        this._mdatLength = undefined;
        this._parseChunk = this._findMoof;
        this._parseChunk(chunk.slice(sliceIndex));
      }
    }
  }

  /**
   * Set keyframe index.
   * @private
   */
  _setKeyframe() {
    // derived from https://github.com/video-dev/hls.js/blob/729a36d409cc78cc391b17a0680eaf743f9213fb/tools/mp4-inspect.js#L48
    for (
      let i = this._moofLength + 8, nalIndex = 0, nalLength;
      i < this._mdatLength;
      i += nalLength, ++nalIndex
    ) {
      nalLength = this._segment.readUInt32BE(i);
      i += 4;
      if ((this._segment[i] & 0x1f) === 0x05) {
        this._keyframe = nalIndex;
        return;
      }
    }
    this._allKeyframes = false;
    this._keyframe = -1;
  }

  /**
   * Set duration and timestamp.
   * @private
   */
  _setDurTime() {
    // derived from https://github.com/video-dev/hls.js/blob/04cc5f167dac2aed4e41e493125968838cb32445/src/utils/mp4-tools.ts#L392
    const duration = (() => {
      const trunIndex = this._segment.indexOf(_TRUN);
      let trunOffset = trunIndex + 4;
      const trunFlags = this._segment.readUInt32BE(trunOffset);
      trunOffset += 4;
      const sampleCount = this._segment.readUInt32BE(trunOffset);
      // prefer using trun sample durations
      if (trunFlags & 0x000100) {
        trunOffset += 4;
        trunFlags & 0x000001 && (trunOffset += 4);
        trunFlags & 0x000004 && (trunOffset += 4);
        const increment =
          4 +
          (trunFlags & 0x000200 && 4) +
          (trunFlags & 0x000400 && 4) +
          (trunFlags & 0x000800 && 4);
        let sampleDurationSum = 0;
        for (let i = 0; i < sampleCount; ++i, trunOffset += increment) {
          sampleDurationSum += this._segment.readUInt32BE(trunOffset);
        }
        return sampleDurationSum / this._timescale;
      }
      // fallback to using tfhd default sample duration
      const tfhdIndex = this._segment.indexOf(_TFHD);
      let tfhdOffset = tfhdIndex + 4;
      const tfhdFlags = this._segment.readUInt32BE(tfhdOffset);
      if (tfhdFlags & 0x000008) {
        tfhdOffset += 8;
        tfhdFlags & 0x000001 && (tfhdOffset += 8);
        tfhdFlags & 0x000002 && (tfhdOffset += 4);
        return (
          (this._segment.readUInt32BE(tfhdOffset) * sampleCount) /
          this._timescale
        );
      }
      return 0;
    })();
    const currentTime = Date.now();
    const elapsed = (currentTime - this._timestamp) / 1000;
    this._timestamp = currentTime;
    this._duration = duration || elapsed;
  }

  /**
   * Process current segment.
   * @fires Mp4Frag#segment
   * @param chunk {Buffer}
   * @private
   */
  _setSegment(chunk) {
    this._segment = chunk;
    this._setKeyframe();
    this._setDurTime();
    this._sequence++;
    if (this._segmentObjects) {
      this._segmentObjects.push({
        segment: this._segment,
        sequence: this._sequence,
        duration: this._duration,
        timestamp: this._timestamp,
        keyframe: this._keyframe,
      });
      this._totalDuration += this._duration;
      this._totalByteLength += this._segment.byteLength;
      while (this._segmentObjects.length > this._segmentCount) {
        const {
          duration,
          segment: { byteLength },
        } = this._segmentObjects.shift();
        this._totalDuration -= duration;
        this._totalByteLength -= byteLength;
      }
      if (this._hlsPlaylistBase) {
        let i =
          this._segmentObjects.length > this._hlsPlaylistSize
            ? this._segmentObjects.length - this._hlsPlaylistSize
            : 0;
        const mediaSequence = this._segmentObjects[i].sequence;
        let targetDuration = 1;
        let segments = '';
        for (i; i < this._segmentObjects.length; i++) {
          targetDuration = Math.max(
            targetDuration,
            this._segmentObjects[i].duration
          );
          segments += `#EXTINF:${this._segmentObjects[i].duration.toFixed(
            6
          )},\n`;
          segments += `${
            this._hlsParentPath ? this._hlsParentPath + '/' : ''
          }${this._hlsPlaylistBase}${this._segmentObjects[i].sequence}.m4s\n`;
        }
        let m3u8 = '#EXTM3U\n';
        m3u8 += '#EXT-X-VERSION:7\n';
        m3u8 += `#EXT-X-TARGETDURATION:${Math.round(targetDuration) || 1}\n`;
        m3u8 += `#EXT-X-MEDIA-SEQUENCE:${mediaSequence}\n`;
        m3u8 += `#EXT-X-MAP:URI="${
          this._hlsParentPath ? this._hlsParentPath + '/' : ''
        }${this._hlsPlaylistBase}.mp4"\n`;
        m3u8 += segments;
        this._m3u8 = m3u8;
      }
    } else {
      this._totalDuration = this._duration;
      this._totalByteLength =
        this._initialization.byteLength + this._segment.byteLength;
    }
    if (this._readableState.pipesCount > 0) {
      this.push(this.segmentObject.segment);
    }
    /**
     * Fires when the latest Mp4 segment is parsed from the piped data.
     * @event Mp4Frag#segment
     * @type {Event}
     * @property {Object} Object - [Mp4Frag.segmentObject]{@link Mp4Frag#segmentObject}
     * @property {Buffer} Object.segment - [Mp4Frag.segment]{@link Mp4Frag#segment}
     * @property {Number} Object.sequence - [Mp4Frag.sequence]{@link Mp4Frag#sequence}
     * @property {Number} Object.duration - [Mp4Frag.duration]{@link Mp4Frag#duration}
     * @property {Number} Object.timestamp - [Mp4Frag.timestamp]{@link Mp4Frag#timestamp}
     * @property {Number} Object.keyframe - [Mp4Frag.keyframe]{@link Mp4Frag#keyframe}
     */
    this.emit('segment', this.segmentObject);
  }

  /**
   * Required for stream transform.
   * @private
   */
  _transform(chunk, encoding, callback) {
    this._parseChunk(chunk);
    callback();
  }

  /**
   * Run cleanup when unpiped.
   * @private
   */
  _flush(callback) {
    this.resetCache();
    callback();
  }

  /**
   * @param {*|Number|String} number
   * @param {Number} def
   * @param {Number} min
   * @param {Number} max
   * @return {Number}
   * @private
   */
  static _validateNumber(number, def, min, max) {
    number = Number.parseInt(number);
    return isNaN(number)
      ? def
      : number < min
      ? min
      : number > max
      ? max
      : number;
  }

  /**
   * @param {*|Boolean} bool
   * @param {Boolean} def
   * @return {Boolean}
   * @private
   */
  static _validateBoolean(bool, def) {
    return typeof bool === 'boolean' ? bool : def;
  }
}

module.exports = Mp4Frag;
