import React, { Component } from 'react';
import styled from 'styled-components';
import memoizeOne from 'memoize-one';
import { Droppable } from 'react-beautiful-dnd';
import Card from './Card';
import { grid, colors, borderRadius } from '../constants';

const Container = styled.div`
  width: 300px;
  margin: ${grid}px;
  border-radius: ${borderRadius}px;
  border: 1px solid ${colors.grey.dark};
  background-color: ${colors.grey.medium};

  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-weight: bold;
  padding: ${grid}px;
`;

const CardList = styled.div`
  padding: ${grid}px;
  min-height: 200px;
  flex-grow: 1;
  transition: background-color 0.2s ease;
  ${props => (props.isDraggingOver ? `background-color: ${colors.grey.darker};` : '')}
`;

const getSelectedMap = memoizeOne((selectedCardKeys) => {
  return selectedCardKeys.reduce((previous, current) => {
    previous[current] = true;
    return previous;
  }, {});
});

export default class Column extends Component {
  render() {
    const { 
      column, 
      cards, 
      selectedCardKeys, 
      draggingCardKey 
    } = this.props;
    return (
      <Container>
        <Title>{column.title}</Title>
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <CardList
              innerRef={provided.innerRef}
              isDraggingOver={snapshot.isDraggingOver}
              {...provided.droppableProps}
            >
              {cards.map((card, index) => {
                const isSelected = Boolean(
                  getSelectedMap(selectedCardKeys)[card.key]
                );
                const isGhosting = isSelected && Boolean(draggingCardKey) && draggingCardKey !== card.key;

                return (
                  <Card
                    key={card.key}
                    card={card}
                    index={index}
                    isSelected={isSelected}
                    isGhosting={isGhosting}
                    selectionCount={selectedCardKeys.length}
                    toggleSelection={this.props.toggleSelection}
                    toggleSelectionInGroup={this.props.toggleSelectionInGroup}
                    multiSelectTo={this.props.multiSelectTo}
                  />
                );
              })}
              {provided.placeholder}
            </CardList>
          )}
        </Droppable>
      </Container>
    );
  }
}