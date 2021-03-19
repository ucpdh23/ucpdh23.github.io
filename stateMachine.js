function createMachine(stateMachineDefinition) {
  const machine = {
    // machine object
    value: stateMachineDefinition.initialState,
    execute(ctx) {
      const currentStateDefinition = stateMachineDefinition[machine.value];
      
      currentStateDefinition.
actions.onExecute(ctx);
    },
    transition(ctx) {
      const currentStateDefinition = stateMachineDefinition[machine.value];

      const destinationTransition = currentStateDefinition.computeTransition(ctx);
      if (!destinationTransition) {
        //currentStateDefinition.actions.onExecute(ctx);
        
        return
      }
      const destinationState = destinationTransition.target
      const destinationStateDefinition =
        stateMachineDefinition[destinationState]
        if (destinationTransition.hasOwnProperty('action')){
          destinationTransition.action(ctx)
        }
    //  destinationTransition.action(ctx)
      currentStateDefinition.actions.onExit(ctx)
      destinationStateDefinition.actions.onEnter(ctx)
      machine.value = destinationState
      return machine.value
    },
  }
  return machine
}