export default class D3Shape {
    constructor (container, config) {
        this.container = container;
        this.config = config;

        this.hooks = [];
    }

    setHooks (hooks) {
        this.hooks = hooks;
        this.hooks && this.hooks.forEach(hook => {
            hook.$parent = this;
        });
    }

    updateHooks (event) {
        this.hooks && this.hooks.forEach(hook => {
            hook.point = hook.updater(this.config, event);
        });
    }

    updatePlugins (event) {
        this.plugins && this.plugins.forEach(plugin => {
            plugin.repaint(event, plugin.config.updater);
        });
    }

    boundaryCheck (num, range) {
        if (num < range[0]) {
            return range[0];
        } else if (num > range[1]) {
            return range[1];
        } else {
            return num
        }
    }

    processDatas (handler) {
        if (handler && typeof handler === 'function') {
            return handler(this.hooks);
        }
        return this.config.model;
    }
}