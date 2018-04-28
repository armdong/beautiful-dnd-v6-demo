import React, { Component } from 'react';
import styled from 'styled-components';
import { DragDropContext } from 'react-beautiful-dnd';
import Column from './Column';
import {
  multiDragAwareReorder,
  multiSelectTo as multiSelect
} from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  user-select: none;
`;

const getCards = (entities, columnId) => {
  return entities.columns[columnId].cardKeys.map(
    cardKey => entities.cards[cardKey]
  );
};

export default class MultiDrag extends Component {
  constructor(props, context) {
    super(props, context);
    
    this.state = {
      entities: this.props.entities,
      selectedCardKeys: [],
      draggingCardKey: null
    };
  }

  componentDidMount() {
    window.addEventListener('click', this.handleWindowClick);
    window.addEventListener('keydown', this.handleWindowKeyDown);
    window.addEventListener('touchend', this.handleWindowTouchEnd);
  }

  componentWillMount() {
    window.removeEventListener('click', this.handleWindowClick);
    window.removeEventListener('keydown', this.handleWindowKeyDown);
    window.removeEventListener('touchend', this.handleWindowTouchEnd);
  }

  handleWindowClick = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    this.unselectAll();
  }

  handleWindowKeyDown = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    if (event.key === 'Escape') {
      this.unselectAll();
    }
  }

  handleWindowTouchEnd = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    this.unselectAll();
  }

  unselect = () => {
    this.unselectAll();
  }

  unselectAll = () => {
    this.setState(prevState => ({
      selectedCardKeys: []
    }));
  }

  handleDragStart = (start) => {
    const key = start.draggableId;
    const selected = this.state.selectedCardKeys.find(cardKey => cardKey === key);

    // if dragging an item that is not selected - unselect all items
    if (!selected) {
      this.unselectAll();
    }

    this.setState(prevState => ({
      draggingCardKey: start.draggableId
    }));
  }

  handleDragEnd = (result) => {
    const { source, destination } = result;

    // noting to do
    if (!destination || result.reason === 'CANCEL') {
      this.setState(prevState => ({
        draggingCardKey: null
      }));

      return;
    }

    const processed = multiDragAwareReorder({
      entities: this.state.entities,
      selectedCardKeys: this.state.selectedCardKeys,
      source,
      destination
    });
    
    this.setState(prevState => ({
      ...processed,
      draggingCardKey: null
    }));
  }

  handleToggleSelection = (cardKey) => {
    const selectedCardKeys = this.state.selectedCardKeys;
    const wasSelected = selectedCardKeys.includes(cardKey);

    const newCardKeys = (() => {
      // Card was not previously selected
      // now will be the only selected item
      if (!wasSelected) {
        return [cardKey];
      }

      // Card was part of a selected group
      // will now become the only selected item
      if (selectedCardKeys.length > 1) {
        return [cardKey];
      }

      // Card was previously selected but not in a group
      // we will now clear the selection
      return [];
    })();

    this.setState(prevState => ({
      selectedCardKeys: newCardKeys
    }));
  }

  handleToggleSelectionInGroup = (cardKey) => {
    const selectedCardKeys = this.state.selectedCardKeys;
    const index = selectedCardKeys.indexOf(cardKey);

    // if not selected - add it to the selected items
    if (index === -1) {
      this.setState(prevState => ({
        selectedCardKeys: [...selectedCardKeys, cardKey]
      }));

      return;
    }

    // it was previously selected and now needs to be
    // removed from the group
    const shallow = [...selectedCardKeys];
    shallow.splice(index, 1);

    this.setState(prevState => ({
      selectedCardKeys: shallow
    }));
  }

  handleMultiSelectTo = (newCardKey) => {
    const updated = multiSelect(
      this.state.entities,
      this.state.selectedCardKeys,
      newCardKey
    );

    if (updated == null) {
      return;
    }

    this.setState(prevState => ({
      selectedCardKeys: updated
    }));
  }

  render() {
    const entities = this.state.entities;
    const selected = this.state.selectedCardKeys;
    
    return (
      <DragDropContext
        onDragStart={this.handleDragStart}
        onDragEnd={this.handleDragEnd}
      >
        <Container>
          {entities.columnOrder.map(columnId => (
            <Column
              column={entities.columns[columnId]}
              cards={getCards(entities, columnId)}
              selectedCardKeys={selected}
              key={columnId}
              draggingCardKey={this.state.draggingCardKey}
              toggleSelection={this.handleToggleSelection}
              toggleSelectionInGroup={this.handleToggleSelectionInGroup}
              multiSelectTo={this.handleMultiSelectTo}
            />
          ))}
        </Container>
      </DragDropContext>
    );
  }
}