const message = 'global property referenced without window prefix';

module.exports = {
    create(context) {
        let globalScope;

        return {
            Program() {
                globalScope = context.getScope();
            },
            // Identifier(node) {
                // if (isGlobalProperty(node) &&
                //     node.parent.type !== "MemberExpression") {
                //     context.report({
                //         node,
                //         message,
                //     });
                // }
            // },
            CallExpression(node) {
                if ( isGlobalProperty(node.callee) ) {
                    context.report({
                        node,
                        message,
                    });
                }
            }
        };

        function isGlobalProperty(node) {  
            return globalScope.variables.some(function(variable) {
                return variable.name === node.name;
            });
        };
    },
}