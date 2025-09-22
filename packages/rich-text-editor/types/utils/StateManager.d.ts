export interface StateUpdatable {
    updateState: () => void;
}
export declare class StateManager {
    private static instance;
    private updateables;
    private isUpdating;
    private constructor();
    static getInstance(): StateManager;
    register(updateable: StateUpdatable): void;
    unregister(updateable: StateUpdatable): void;
    updateAll(): void;
    cleanup(): void;
    get registeredCount(): number;
}
