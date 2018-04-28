// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  
  return result;
};

export const reorderCardMap = ({
  cardMap,
  source,
  destination
}) => {
  const current = [...cardMap[source.droppableId]];
  const next = [...cardMap[destination.droppableId]];
  const target = current[source.index];

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(
      current, 
      source.index, 
      destination.index
    );
    const result = {
      ...cardMap,
      [source.droppableId]: reordered
    };

    return {
      cardMap: result,
      // not auto focusing in own list
      autoFocusCardKey: null
    };
  }

  // moving to different list

  // remove from original
  current.splice(source.index, 1);
  // insert into next
  next.splice(destination.index, 0, target);

  const result = {
    ...cardMap,
    [source.droppableId]: current,
    [destination.droppableId]: next
  };

  return {
    cardMap: result,
    autoFocusCardKey: target.key
  };
};

export default reorder;