import React, { Component } from 'react';
import { Form, FormControl, InputGroup } from 'react-bootstrap';

interface Props {
  range: { min?: any; max?: any; step?: any };
  type: 'x' | 'y' | 'z';
  inputWidth?: number;
  onChangeValue?: (val: { type: 'x' | 'y' | 'z'; value: any }) => void;
  value: any;
}

type State = {};

export default class SlideValue extends Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const inputGroupStyle = {
      width: this.props.inputWidth || 100,
    };
    return (
      <Form.Group className="mb-3">
        <Form.Label>
          <InputGroup>
            <InputGroup.Text>{this.props.type} :</InputGroup.Text>
            <FormControl
              type="number"
              style={inputGroupStyle}
              min={this.props.range.min}
              max={this.props.range.max}
              step={this.props.range.step}
              value={this.props.value}
              onChange={(ev) => {
                if (this.props.onChangeValue) {
                  this.props.onChangeValue({
                    type: this.props.type,
                    value: ev.target.value,
                  });
                }
              }}
              aria-label="Dollar amount (with dot and two decimal places)"
            />
          </InputGroup>
        </Form.Label>
        <Form.Range
          min={this.props.range.min}
          max={this.props.range.max}
          step={this.props.range.step}
          value={this.props.value}
          onChange={(ev) => {
            if (this.props.onChangeValue) {
              this.props.onChangeValue({
                type: this.props.type,
                value: ev.target.value,
              });
            }
          }}
        />
      </Form.Group>
    );
  }
}
