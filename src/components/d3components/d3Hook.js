export default class D3Hook {
    constructor ({ point, connected, type, position, updater }) {
        this.point      = point;
        this.connected  = connected;
        this.type       = type;
        this.position   = position;
        this.updater    = updater;
    }

    getInData () {
        return this.connector.getOutData();
    }

    getOutData () {
        if (this.$parent.hooks && this.$parent.hooks.length > 1) {
            return this.$parent.processDatas(hooks => {
                let datas = [];
                hooks.forEach(hook => {
                    hook.type == 'in' && datas.push(hook.getInData());
                });
                return datas;
            });
        } else {
            return this.$parent.processDatas();
        }
    }
}