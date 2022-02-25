import { Close } from '@mui/icons-material';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import React, { Component } from 'react';

type Props = {
  title: string;
  onRemoveItem: (index) => void;
  index: number;
  buttons?: React.ReactNode[];
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
              {this.props.title}
            </Typography>
            <div
              style={{
                flexGrow: 1,
              }}
            />
            {this.props.buttons?.map((btn, index) => {
              return btn;
            })}
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
        <Box
          style={{
            overflow: 'auto',
            height: 'calc(100% - 42px)',
            width: '100%',
          }}
        >
          {this.props.children}
        </Box>
      </>
    );
  }
}

export default LayoutItem;
