import React, { Component } from 'react';
import styled from 'styled-components';
import { Draggable } from 'react-beautiful-dnd';
import { grid, colors, borderRadius } from '../constants';

const primaryButton = 0;

const getBackgroundColor = ({
  isSelected,
  isGhosting
}) => {
  if (isGhosting) {
    return colors.grey.light;
  }

  if (isSelected) {
    return colors.blue.light;
  }

  return colors.grey.light;
};

const getColor = ({
  isSelected,
  isGhosting
}) => {
  if (isGhosting) {
    return 'darkgrey';
  }

  if (isSelected) {
    return colors.blue.deep;
  }

  return colors.black;
};

const Container = styled.div`
  background-color: ${props => getBackgroundColor(props)};
  color: ${props => getColor(props)};
  padding: ${grid}px;
  margin-bottom: ${grid}px;
  border-radius: ${borderRadius}px;
  font-size: 18px;
  border: 1px solid ${colors.shadow};

  ${props => (props.isDragging ? `box-shadow: 2px 2px 1px ${colors.shadow};` : '')}
  ${props => (props.isGhosting ? 'opacity: 0.8;' : '')}

  position: relative;

  &:focus {
    outline: none;
    border-color: ${colors.blue.deep};
  }
`;

const Content = styled.div``;

const size = 30;

const SelectionCount = styled.div`
  right: -${grid}px;
  top: -${grid}px;
  color: ${colors.white};
  background-color: ${colors.blue.deep};
  border-radius: 50%;
  height: ${size}px;
  width: ${size}px;
  line-height: ${size}px;
  position: absolute;
  text-align: center;
  font-size: 0.8rem;
`;

const keyCodes = {
  enter: 13,
  escape: 27,
  arrowDown: 40,
  arrowUp: 38,
  tab: 9
};

export default class Card extends Component {
  performAction = (wasMetaKeyUsed, wasShiftKeyUsed) => {
    const {
      card,
      toggleSelection,
      toggleSelectionInGroup,
      multiSelectTo
    } =  this.props;

    if (wasMetaKeyUsed) {
      toggleSelectionInGroup(card.key);
      return;
    }

    if (wasShiftKeyUsed) {
      multiSelectTo(card.key);
      return;
    }

    toggleSelection(card.key);
  }

  handleKeyDown = (event, provided, snapshot) => {
    if (provided.dragHandleProps) {
      provided.dragHandleProps.onKeyDown(event);
    }

    if (event.defaultPrevented) {
      return;
    }

    if (snapshot.isDragging) {
      return;
    }

    if (event.keyCode !== keyCodes.enter) {
      return;
    }

    // we are using the event for selection
    event.preventDefault();

    const wasMetaKeyUsed = event.metaKey;
    const wasShiftKeyUsed = event.shiftKey;

    this.performAction(wasMetaKeyUsed, wasShiftKeyUsed);
  }

  handleClick = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== primaryButton) {
      return;
    }

    // marking the event as used
    event.preventDefault();

    const wasMetaKeyUsed = event.metaKey;
    const wasShiftKeyUsed = event.shiftKey;

    this.performAction(wasMetaKeyUsed, wasShiftKeyUsed);
  }

  handleTouchEnd = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    event.preventDefault();
    this.props.toggleSelectionInGroup(this.props.card.key);
  }

  render() {
    const {
      card,
      index,
      isSelected,
      selectionCount,
      isGhosting
    } = this.props;

    return (
      <Draggable 
        draggableId={card.key}
        index={index}
      >
        {(provided, snapshot) => {
          const shouldShowSelection = snapshot.isDragging && selectionCount > 1;

          return (
            <div>
              <Container
                innerRef={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                onClick={this.handleClick}
                onTouchEnd={this.handleTouchEnd}
                onKeyDown={(event) => this.handleKeyDown(event, provided, snapshot)}
                isDragging={snapshot.isDragging}
                isSelected={isSelected}
                isGhosting={isGhosting}
              >
                <Content>{card.name}</Content>
                {shouldShowSelection && 
                  <SelectionCount>{selectionCount}</SelectionCount>
                }
              </Container>
              {provided.placeholder}
            </div>
          );
        }}
      </Draggable>
    );
  }
}