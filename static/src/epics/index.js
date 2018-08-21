import { combineEpics } from 'redux-observable';
import tideDogEpics from './tideDog';

const epics = combineEpics(
    ...tideDogEpics
);

export default epics;
