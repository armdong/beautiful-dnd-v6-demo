export default (columns) => {
  const cards = columns;

  const cardMap = cards.reduce((previous, current) => {
    previous[current.key] = current;
    return previous;
  }, {});

  const all = {
    id: 'all',
    title: '所有列',
    cardKeys: cards.map(card => card.key)
  };

  const visible = {
    id: 'visible',
    title: '显示列',
    cardKeys: []
  };

  const invisible = {
    id: 'invisible',
    title: '不显示列',
    cardKeys: []
  };

  const entities = {
    columnOrder: [all.id, visible.id, invisible.id],
    columns: {
      [all.id]: all,
      [visible.id]: visible,
      [invisible.id]: invisible
    },
    cards: cardMap
  };

  return entities;
};