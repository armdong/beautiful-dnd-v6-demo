import reorder from './reorder';

const withNewCardKeys = (column, cardKeys) => ({
  id: column.id,
  title: column.title,
  cardKeys
});

const reorderSingleDrag = ({
  entities,
  selectedCardKeys,
  source,
  destination
}) => {
  // moving in the same list
  if (source.droppableId === destination.droppableId) {
    const column = entities.columns[source.droppableId];
    const reordered = reorder(
      column.cardKeys,
      source.index,
      destination.index
    );

    const updated = {
      ...entities,
      columns: {
        ...entities.columns,
        [column.id]: withNewCardKeys(column, reordered)
      }
    };

    return {
      entities: updated,
      selectedCardKeys
    };
  }

  // moving to a different list
  const home = entities.columns[source.droppableId];
  const foreign = entities.columns[destination.droppableId];

  // the key of the card to be moved
  const cardKey = home.cardKeys[source.index];

  // remove from home column
  const newHomeCardKeys = [...home.cardKeys];
  newHomeCardKeys.splice(source.index, 1);

  // add to foreign column
  const newForeignCardKeys = [...foreign.cardKeys];
  newForeignCardKeys.splice(destination.index, 0, cardKey);

  const updated = {
    ...entities,
    columns: {
      ...entities.columns,
      [home.id]: withNewCardKeys(home, newHomeCardKeys),
      [foreign.id]: withNewCardKeys(foreign, newForeignCardKeys)
    }
  };

  return {
    entities: updated,
    selectedCardKeys
  };
};

export const getHomeColumn = (entities, cardKey) => {
  const columnId = entities.columnOrder.find(id => {
    const column = entities.columns[id];
    return column.cardKeys.includes(cardKey);
  });

  if (!columnId) {
    console.error('Could not find column for card', cardKey, entities);
    throw new Error('boom');
  }

  return entities.columns[columnId];
};

const reorderMultiDrag = ({
  entities,
  selectedCardKeys,
  source,
  destination
}) => {
  const start = entities.columns[source.droppableId];
  const dragged = start.cardKeys[source.index];

  const insertAtIndex = (() => {
    const destinationIndexOffset = selectedCardKeys.reduce(
      (previous, current) => {
        if (current === dragged) {
          return previous;
        }

        const final = entities.columns[destination.droppableId];
        const column = getHomeColumn(entities, current);

        if (column !== final) {
          return previous;
        }

        const index = column.cardKeys.indexOf(current);

        if (index >= destination.index) {
          return previous;
        }

        // the selected item is before the destination index
        // we need to account for this when inserting into
        // the new location
        return previous + 1;
      }, 0);

    const result = destination.index - destinationIndexOffset;
    return result;
  })();

  // doing the ordering now as we are required to look up columns
  // and know original ordering
  const orderedSelectedCardKeys = [...selectedCardKeys];
  orderedSelectedCardKeys.sort((a, b) => {
    // moving the dragged item to the top of the list
    if (a === dragged) {
      return -1;
    }
    if (b === dragged) {
      return 1;
    }

    // sorting by their natural indexes
    const columnForA = getHomeColumn(entities, a);
    const indexOfA = columnForA.cardKeys.indexOf(a);
    const columnForB = getHomeColumn(entities, b);
    const indexOfB = columnForB.cardKeys.indexOf(b);

    if (indexOfA !== indexOfB) {
      return indexOfA - indexOfB;
    }

    // sorting by their order in the selectedCardKeys list
    return -1;
  });

  // we need to remove all of the selected cards from their columns
  const withRemovedCards = entities.columnOrder.reduce(
    (previous, columnId) => {
      const column = entities.columns[columnId];

      // remove the key's of the items that are selected
      const remainingCardKeys = column.cardKeys.filter(
        key => !selectedCardKeys.includes(key)
      );

      previous[column.id] = withNewCardKeys(column, remainingCardKeys);
      return previous;
    }, entities.columns);

  const final = withRemovedCards[destination.droppableId];
  const withInserted = (() => {
    const base = [...final.cardKeys];
    base.splice(insertAtIndex, 0, ...orderedSelectedCardKeys);
    return base;
  })();

  // insert all selected cards into final column
  const withAddedCards = {
    ...withRemovedCards,
    [final.id]: withNewCardKeys(final, withInserted)
  };

  const updated = {
    ...entities,
    columns: withAddedCards
  };

  return {
    entities: updated,
    selectedCardKeys: orderedSelectedCardKeys
  };
};

export const multiDragAwareReorder = args => {
  if (args.selectedCardKeys.length > 1) {
    return reorderMultiDrag(args);
  }

  return reorderSingleDrag(args);
};

export const multiSelectTo = (
  entities,
  selectedCardKeys,
  newCardKey
) => {
  // noting already selected
  if (!selectedCardKeys.length) {
    return [newCardKey];
  }

  const columnOfNew = getHomeColumn(entities, newCardKey);
  const indexOfNew = columnOfNew.cardKeys.indexOf(newCardKey);

  const lastSelected = selectedCardKeys[selectedCardKeys.length - 1];
  const columnOfLast = getHomeColumn(entities, lastSelected);
  const indexOfLast = columnOfLast.cardKeys.indexOf(lastSelected);

  // multi selecting to another column
  // select everything up to the index of the current item
  if (columnOfNew !== columnOfLast) {
    return columnOfNew.cardKeys.slice(0, indexOfNew + 1);
  }

  // multi selecting in the same column
  // need to select everything between the last index
  // and the current index inclusive

  // noting to do here
  if (indexOfNew === indexOfLast) {
    return null;
  }

  const isSelectingForwards = indexOfNew > indexOfLast;
  const start = isSelectingForwards ? indexOfLast : indexOfNew;
  const end = isSelectingForwards ? indexOfNew : indexOfLast;

  const inBetween = columnOfNew.cardKeys.slice(start, end + 1);

  // everything inbetween needs to have it's selection toggled.
  // with the exception of the start and end values which will
  // always be selected

  const toAdd = inBetween.filter(id => {
    // if already selected: then to need to select it again
    if (selectedCardKeys.includes(cardKey)) {
      return false;
    }

    return true;
  });

  const sorted = isSelectingForwards ? toAdd : [...toAdd].reverse();
  const combined = [...selectedCardKeys, ...sorted];

  return combined;
};