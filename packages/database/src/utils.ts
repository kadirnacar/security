import * as fs from 'fs';
import * as path from 'path';

export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export class Utils {
  public static deleteFolderRecursive(path: string) {
    if (fs.existsSync(path)) {
      if (fs.lstatSync(path).isDirectory()) {
        // recurse
        fs.readdirSync(path).forEach((file: string, index: number) => {
          const curPath = path + '/' + file;
          if (fs.lstatSync(curPath).isDirectory()) {
            // recurse
            Utils.deleteFolderRecursive(curPath);
          } else {
            // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(path);
      } else {
        // delete file
        fs.unlinkSync(path);
      }
    }
  }
  public static isEmpty(obj: any) {
    if (!obj) return true;
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) return false;
    }

    return true;
  }

  public static renameFolder(oldName: string, newName: string) {
    fs.renameSync(oldName, newName);
  }

  public static checkFileExists(path: string) {
    return fs.existsSync(path);
  }
  public static mkDirByPathSync(
    targetDir: string,
    { isRelativeToScript = false } = {}
  ) {
    const sep = path.sep;
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';

    return targetDir.split(sep).reduce((parentDir, childDir) => {
      const curDir = path.resolve(baseDir, parentDir, childDir);
      try {
        fs.mkdirSync(curDir);
      } catch (err: any) {
        if (err.code === 'EEXIST') {
          // curDir already exists!
          return curDir;
        }

        // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
        if (err.code === 'ENOENT') {
          // Throw the original parentDir error on curDir `ENOENT` failure.
          throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
        }

        const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
        if (!caughtErr || (caughtErr && curDir === path.resolve(targetDir))) {
          throw err; // Throw if it's just the last created dir.
        }
      }

      return curDir;
    }, initDir);
  }
}
