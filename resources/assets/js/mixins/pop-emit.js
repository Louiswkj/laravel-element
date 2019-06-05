/**
 * the pop-emit mixin provides popEmit() method
 */
export default {
    methods: {
        /**
         * @param {string} componentName
         * @param {string} eventName
         * @param {Array} params
         */
        popEmit: function (componentName, eventName, params) {
            let parent = this.$parent || this.$root;
            let name = parent.$options.componentName;

            while (parent && (!name || name !== componentName)) {
                parent = parent.$parent;

                if (parent) {
                    name = parent.$options.componentName;
                }
            }

            if (parent) {
                parent.$emit.apply(parent, [eventName].concat(params));
            }
        }
    }
}