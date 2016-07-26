import { IClientProps, ClientProps, IModelTypeComposite, IModelView } from '@hn3000/metamodel';
import { IFormContext, IFormConfig, IModelUpdater } from './api';
export declare class MetaFormContext extends ClientProps implements IFormContext, IClientProps {
    constructor(config: IFormConfig, metamodel: IModelTypeComposite<any>, data?: any);
    pageNext: (event: UIEvent) => void;
    pageBack: (event: UIEvent) => void;
    pageNextAllowed(): boolean;
    pageBackAllowed(): boolean;
    readonly config: IFormConfig;
    readonly metamodel: IModelTypeComposite<any>;
    readonly viewmodel: IModelView<any>;
    readonly currentPage: number;
    subscribe(listener: () => any): () => void;
    updateModel(field: string, value: any): void;
    updateModelTransactional(updater: IModelUpdater): void;
    private _debounceValidationTimeout;
    _updateViewModel(viewmodel: IModelView<any>): void;
    _notifyAll(): void;
    updatePage(step: number): void;
    private _listeners;
    private _config;
    private _metamodel;
    private _viewmodel;
}
