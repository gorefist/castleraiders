// [Sergio D. Jubera]
// Represents the AI machine state for all the 

AiAutomaton_HumanClass = AiAutomatonClass.extend({
    init: function(entity) {
        this.parent(entity);
    },
    update: function() {
        
    }
});

gAiEngine.factory['human'] = AiAutomaton_HumanClass;