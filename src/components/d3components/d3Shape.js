export default class D3Shape {
    constructor (container, config) {
        this.container = container;
        this.config = config;

        this.hooks = []
    }

    setHooks (hooks) {
        this.hooks = hooks;
    }

    updateHooks (event) {
        this.hooks.forEach(hook => {
            hook.point = hook.updater(this.config, event);
        });
    }
}