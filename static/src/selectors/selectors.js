import { createSelector } from 'reselect';

const selectTideDog = state => state.tideDog;

export const makeTideDogSelector = () => createSelector(
    selectTideDog,
    state => state
);
