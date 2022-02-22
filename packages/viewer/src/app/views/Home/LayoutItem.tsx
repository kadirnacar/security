import {
  AppBar,
  Box,
  Container,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import React, { Component } from 'react';

type Props = {
  item: any;
  onRemoveItem: (index) => void;
  index: number;
};

class LayoutItem extends Component<Props, any> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <AppBar
          className={'dragger'}
          color="transparent"
          style={{ height: 42 }}
        >
          <Toolbar
            style={{
              height: 42,
              minHeight: 42,
            }}
          >
            <Typography variant="h6" color="textSecondary">
              {this.props.item.i}
            </Typography>
            <div
              style={{
                flexGrow: 1,
              }}
            />
            <IconButton
              edge="end"
              title="Kapat"
              size="small"
              onClick={this.props.onRemoveItem.bind(this, this.props.index)}
            >
              <Close fontSize="small" />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Toolbar
          style={{
            height: 42,
            minHeight: 42,
          }}
        />
        <Container>
          <Box sx={{ my: 2 }}>{this.props.children}</Box>
        </Container>
      </>
    );
  }
}

export default LayoutItem;
