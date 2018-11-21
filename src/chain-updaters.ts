import { IModelView } from '@hn3000/metamodel';
import { IModelUpdater, IFormContext } from './api-input';

export function chainUpdaters(...updaters:IModelUpdater[]):IModelUpdater {
    return (model:IModelView<any>, c:IFormContext) => {
        return updaters.reduce((m,u) => u(m,c), model);
    }
}