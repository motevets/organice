import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Motion, spring } from 'react-motion';

import './ActionDrawer.css';

import _ from 'lodash';
import { List } from 'immutable';

import * as orgActions from '../../../../actions/org';
import * as dropboxActions from '../../../../actions/dropbox';
import * as captureActions from '../../../../actions/capture';

import ActionButton from './components/ActionButton/';

class ActionDrawer extends PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'handleMoveHeaderUpClick',
      'handleMoveHeaderDownClick',
      'handleMoveHeaderLeftClick',
      'handleMoveHeaderRightClick',
      'handleMoveSubtreeLeftClick',
      'handleMoveSubtreeRightClick',
      'handleDoneClick',
      'handleMoveTableRowDownClick',
      'handleMoveTableRowUpClick',
      'handleMoveTableColumnLeftClick',
      'handleMoveTableColumnRightClick',
      'handleSync',
      'handleMainArrowButtonClick',
      'handleMainCaptureButtonClick',
    ]);

    this.state = {
      isDisplayingArrowButtons: false,
      isDisplayingCaptureButtons: false,
    };
  }

  componentDidMount() {
    // Send a no-op action to take care of the bug where redux-undo won't allow the first
    // action to be undone.
    this.props.org.noOp();

    document.querySelector('html').style.paddingBottom = '90px';
  }

  componentWillUnmount() {
    document.querySelector('html').style.paddingBottom = '0px';
  }

  handleMoveHeaderUpClick() {
    this.props.org.moveHeaderUp(this.props.selectedHeaderId);
  }

  handleMoveHeaderDownClick() {
    this.props.org.moveHeaderDown(this.props.selectedHeaderId);
  }

  handleMoveHeaderLeftClick() {
    this.props.org.moveHeaderLeft(this.props.selectedHeaderId);
  }

  handleMoveHeaderRightClick() {
    this.props.org.moveHeaderRight(this.props.selectedHeaderId);
  }

  handleMoveSubtreeLeftClick() {
    this.props.org.moveSubtreeLeft(this.props.selectedHeaderId);
  }

  handleMoveSubtreeRightClick() {
    this.props.org.moveSubtreeRight(this.props.selectedHeaderId);
  }

  handleDoneClick() {
    this.props.org.exitTitleEditMode();
    this.props.org.exitDescriptionEditMode();
    this.props.org.exitTableEditMode();
  }

  handleMoveTableRowDownClick() {
    this.props.org.moveTableRowDown();
  }

  handleMoveTableRowUpClick() {
    this.props.org.moveTableRowUp();
  }

  handleMoveTableColumnLeftClick() {
    this.props.org.moveTableColumnLeft();
  }

  handleMoveTableColumnRightClick() {
    this.props.org.moveTableColumnRight();
  }

  handleCaptureButtonClick(templateId) {
    return () => {
      this.setState({ isDisplayingCaptureButtons: false });
      this.props.capture.activateCaptureModalForTemplateId(templateId);
    };
  }

  getAvailableCaptureTemplates() {
    return this.props.captureTemplates.filter(template => (
      template.get('isAvailableInAllOrgFiles') || template.get('orgFilesWhereAvailable').map(availablePath => (
        availablePath.trim()
      )).includes((this.props.path || '').trim())
    ));
  }

  renderCaptureButtons() {
    const { isDisplayingArrowButtons, isDisplayingCaptureButtons } = this.state;

    const availableCaptureTemplates = this.getAvailableCaptureTemplates();

    const baseCaptureButtonStyle = {
      position: 'absolute',
      zIndex: 0,
      left: 0,
      opacity: isDisplayingArrowButtons ? 0 : 1,
    };
    if (!isDisplayingCaptureButtons) {
      baseCaptureButtonStyle.boxShadow = 'none';
    }

    const mainButtonStyle = {
      opacity: isDisplayingArrowButtons ? 0 : 1,
      position: 'relative',
      zIndex: 1,
    };

    const animatedStyle = {
      bottom: spring(isDisplayingCaptureButtons ? 70 : 0, { stiffness: 300 }),
    };

    return (
      <Motion style={animatedStyle}>
        {style => (
          <div className="action-drawer__capture-buttons-container">
            <ActionButton iconName={isDisplayingCaptureButtons ? 'times' : 'list-ul'}
                          isDisabled={false}
                          onClick={this.handleMainCaptureButtonClick}
                          style={mainButtonStyle} />

            {availableCaptureTemplates.map((template, index) => (
              <ActionButton key={template.get('id')}
                            letter={template.get('letter')}
                            iconName={template.get('iconName')}
                            isDisabled={false}
                            onClick={this.handleCaptureButtonClick(template.get('id'))}
                            style={{...baseCaptureButtonStyle, bottom: style.bottom * (index + 1)}} />
            ))}
          </div>
        )}
      </Motion>
    );
  }

  handleMainArrowButtonClick() {
    this.setState({
      isDisplayingArrowButtons: !this.state.isDisplayingArrowButtons,
    });
  }

  handleMainCaptureButtonClick() {
    if (!this.state.isDisplayingCaptureButtons && this.getAvailableCaptureTemplates().size === 0) {
      alert(`You don't have any capture templates set up for this file! Add some in Settings > Capture Templates`);
      return;
    }

    this.setState({
      isDisplayingCaptureButtons: !this.state.isDisplayingCaptureButtons,
    });
  }

  renderArrowButtons() {
    const { selectedTableCellId } = this.props;
    const { isDisplayingArrowButtons, isDisplayingCaptureButtons } = this.state;

    const baseArrowButtonStyle = {
      opacity: isDisplayingCaptureButtons ? 0 : 1,
    };
    if (!isDisplayingArrowButtons) {
      baseArrowButtonStyle.boxShadow = 'none';
    }

    const animatedStyles = {
      topRowYOffset: spring(isDisplayingArrowButtons ? 150 : 0, { stiffness: 300 }),
      bottomRowYOffset:spring(isDisplayingArrowButtons ?  80 : 0, { stiffness: 300 }),
      firstColumnXOffset:spring(isDisplayingArrowButtons ?  70 : 0, { stiffness: 300 }),
      secondColumnXOffset: spring(isDisplayingArrowButtons ? 140 : 0, { stiffness: 300 }),
    };

    // <ActionButton iconName="arrow-up" subIconName="columns" shouldRotateSubIcon isDisabled={false} onClick={this.handleMoveTableRowUpClick} />
    // <ActionButton iconName="arrow-down" subIconName="columns" shouldRotateSubIcon isDisabled={false} onClick={this.handleMoveTableRowDownClick} />
    // <ActionButton iconName="arrow-left" subIconName="columns" isDisabled={false} onClick={this.handleMoveTableColumnLeftClick} />
    // <ActionButton iconName="arrow-right" subIconName="columns" isDisabled={false} onClick={this.handleMoveTableColumnRightClick} />

    return (
      <Motion style={animatedStyles}>
        {style => (
          <div className="action-drawer__arrow-buttons-container">
            <ActionButton additionalClassName="action-drawer__arrow-button" iconName="arrow-up" isDisabled={false} onClick={this.handleMoveHeaderUpClick} style={{...baseArrowButtonStyle, bottom: style.topRowYOffset}} />
            <ActionButton additionalClassName="action-drawer__arrow-button" iconName="arrow-down" isDisabled={false} onClick={this.handleMoveHeaderDownClick} style={{...baseArrowButtonStyle, bottom: style.bottomRowYOffset}} />
            <ActionButton additionalClassName="action-drawer__arrow-button" iconName="arrow-left" isDisabled={false} onClick={this.handleMoveHeaderLeftClick} style={{...baseArrowButtonStyle, bottom: style.bottomRowYOffset, right: style.firstColumnXOffset}} />
            <ActionButton additionalClassName="action-drawer__arrow-button" iconName="arrow-right" isDisabled={false} onClick={this.handleMoveHeaderRightClick} style={{...baseArrowButtonStyle, bottom: style.bottomRowYOffset, left: style.firstColumnXOffset}} />
            <ActionButton additionalClassName="action-drawer__arrow-button" iconName="chevron-left" isDisabled={false} onClick={this.handleMoveSubtreeLeftClick} style={{...baseArrowButtonStyle, bottom: style.bottomRowYOffset, right: style.secondColumnXOffset}} />
            <ActionButton additionalClassName="action-drawer__arrow-button" iconName="chevron-right" isDisabled={false} onClick={this.handleMoveSubtreeRightClick} style={{...baseArrowButtonStyle, bottom: style.bottomRowYOffset, left: style.secondColumnXOffset}} />

            <ActionButton iconName={isDisplayingArrowButtons ? 'times' : 'arrows-alt'}
                          subIconName={!!selectedTableCellId ? 'table' : null}
                          isDisabled={false}
                          onClick={this.handleMainArrowButtonClick}
                          style={{opacity: isDisplayingCaptureButtons ? 0 : 1}}
                          additionalClassName="action-drawer__main-arrow-button" />
          </div>
        )}
      </Motion>
    );
  }

  handleSync() {
    this.props.org.sync();
  }

  render() {
    const {
      inTitleEditMode,
      inDescriptionEditMode,
      shouldDisableSyncButtons,
      selectedTableCellId,
      inTableEditMode,
    } = this.props;
    const { isDisplayingArrowButtons, isDisplayingCaptureButtons } = this.state;

    return (
      <div className="action-drawer-container nice-scroll">
        {(inTitleEditMode || inDescriptionEditMode || inTableEditMode) ? (
          <button className="btn action-drawer__done-btn"
                  onClick={this.handleDoneClick}>Done</button>
        ) : (
          <Fragment>
            {false && !!selectedTableCellId && (
              <Fragment>
                <ActionButton iconName="arrow-up" subIconName="columns" shouldRotateSubIcon isDisabled={false} onClick={this.handleMoveTableRowUpClick} />
                <ActionButton iconName="arrow-down" subIconName="columns" shouldRotateSubIcon isDisabled={false} onClick={this.handleMoveTableRowDownClick} />
                <ActionButton iconName="arrow-left" subIconName="columns" isDisabled={false} onClick={this.handleMoveTableColumnLeftClick} />
                <ActionButton iconName="arrow-right" subIconName="columns" isDisabled={false} onClick={this.handleMoveTableColumnRightClick} />
              </Fragment>
            )}

            <ActionButton iconName="cloud"
                          subIconName="sync-alt"
                          isDisabled={shouldDisableSyncButtons}
                          onClick={this.handleSync}
                          style={{opacity: (isDisplayingArrowButtons || isDisplayingCaptureButtons) ? 0 : 1}} />

            {this.renderArrowButtons()}

            {this.renderCaptureButtons()}
          </Fragment>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    inTitleEditMode: state.org.present.get('inTitleEditMode'),
    inDescriptionEditMode: state.org.present.get('inDescriptionEditMode'),
    inTableEditMode: state.org.present.get('inTableEditMode'),
    selectedHeaderId: state.org.present.get('selectedHeaderId'),
    isDirty: state.org.present.get('isDirty'),
    isFocusedHeaderActive: !!state.org.present.get('focusedHeaderId'),
    selectedTableCellId: state.org.present.get('selectedTableCellId'),
    captureTemplates: state.capture.get('captureTemplates', new List()),
    path: state.org.present.get('path'),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    org: bindActionCreators(orgActions, dispatch),
    dropbox: bindActionCreators(dropboxActions, dispatch),
    capture: bindActionCreators(captureActions, dispatch),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ActionDrawer);
