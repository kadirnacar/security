import React, { Component } from 'react';
import { FormControl, InputGroup } from 'react-bootstrap';

interface Props {
  range: { min: any; max: any; step: any; speed: any };
  inputWidth?: number;
  onChangeValue?: (val: {
    type: 'min' | 'max' | 'step' | 'speed';
    value: any;
  }) => void;
}

type State = {};

export default class MinMaxValue extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const inputGroupStyle = {
      width: this.props.inputWidth || 100,
    };
    return (
      <>
        <InputGroup.Text>Min :</InputGroup.Text>
        <FormControl
          type="number"
          value={this.props.range.min}
          style={inputGroupStyle}
          step={0.01}
          onChange={(ev) => {
            const { range } = this.props;
            if (range) {
              range.min = ev.target.value;
              if (this.props.onChangeValue) {
                this.props.onChangeValue({ type: 'min', value: range.min });
              }
            }
          }}
          aria-label="Dollar amount (with dot and two decimal places)"
        />

        <InputGroup.Text>Max :</InputGroup.Text>
        <FormControl
          type="number"
          value={this.props.range.max}
          style={inputGroupStyle}
          step={0.01}
          onChange={(ev) => {
            const { range } = this.props;
            if (range) {
              range.max = ev.target.value;
              if (this.props.onChangeValue) {
                this.props.onChangeValue({ type: 'max', value: range.max });
              }
            }
          }}
          aria-label="Dollar amount (with dot and two decimal places)"
        />
        <InputGroup.Text>Step :</InputGroup.Text>
        <FormControl
          type="number"
          value={this.props.range.step}
          style={inputGroupStyle}
          step={0.01}
          onChange={(ev) => {
            const { range } = this.props;
            if (range) {
              range.step = ev.target.value;
              if (this.props.onChangeValue) {
                this.props.onChangeValue({ type: 'step', value: range.step });
              }
            }
          }}
          aria-label="Dollar amount (with dot and two decimal places)"
        />
        <InputGroup.Text>Speed :</InputGroup.Text>
        <FormControl
          type="number"
          value={this.props.range.speed}
          style={inputGroupStyle}
          step={0.01}
          onChange={(ev) => {
            const { range } = this.props;
            if (range) {
              range.speed = ev.target.value;
              if (this.props.onChangeValue) {
                this.props.onChangeValue({ type: 'speed', value: range.speed });
              }
            }
          }}
          aria-label="Dollar amount (with dot and two decimal places)"
        />
      </>
    );
  }
}
