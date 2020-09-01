function createDefaultStateMachine() {
  return createMachine({
  initialState: 'init',
  init: {
    actions: {
      onEnter(ctx) {
       // console.log('off: onEnter')
      },
      onExit(ctx) {},
      onExecute(ctx){
         ctx.cyclist.computeForces_1(ctx.first);
      }
    },
    computeTransition(ctx){
      if (ctx.message == 'tira') {
        var targetName = 'preparePulling';
        
        if (ctx.first.id == ctx.cyclist.id) targetName = 'pulling';
        
        return {
      target: targetName,
        action(){
          ctx.message = '';
        
        },
      };
        }
    if (ctx.cyclist.id == ctx.first.id) {
      return {
        target: 'first',
        action(){},
        };
    }
   },
  },
  first: {
    actions: {
      onEnter(ctx) {},
      onExit(ctx) {},
      onExecute(ctx) {
      ctx.cyclist.computeForces_0(ctx.first);
      },
    },
    computeTransition(ctx){
    if (ctx.first.id != ctx.cyclist.id)
      return {
        target: 'init',
        action(){}
        };
    
    }
  },
    pulling: {
      actions: {
        onEnter(ctx){print('tirando');},
        onExit(ctx){},
        onExecute(ctx){
          if (tirando.includes(ctx.cyclist)) {
           ctx.cyclist.computeForces_0(ctx.first);
          
          }

        
        }
        
        },
      computeTransition(ctx){
        }
      
  },
    
    preparePulling: {
      actions: {
        onEnter(ctx){
          print('prepare');
        ctx.cyclist.preparePulling= null;
        },
        onExit(ctx){
    print('prepared');   
          ctx.cyclist.preparePulling = null;
        },
        onExecute(ctx) {
          if (tirando.includes(ctx.cyclist)) return;
          
          
          if (ctx.first.id == ctx.cyclist.id) {
           print('first')
            tirando.push(ctx.cyclist);
            
            } else {
              
              
          ctx.cyclist._mGoodPosition = 0;
          ctx.cyclist.computeForces_2(ctx.first);
          
          }
        }
        
        },
      computeTransition(ctx){
        if (tirando.includes(ctx.cyclist))
        return {
          target: 'pulling',
          action(){}
        };
      }
      
  },
});
}

function createPreparePulling() {
  return createMachine({
  initialState: 'init',
  init: {
    actions: {
      onEnter(ctx) {
       // console.log('off: onEnter')
      },
      onExit(ctx) {},
      onExecute(ctx){
         ctx.cyclist.computeForces_1(ctx.first);
      }
    },
    computeTransition(ctx){
      if (ctx.message == 'tira') {
        var targetName = 'preparePulling';
        
        if (ctx.first.id == ctx.cyclist.id) targetName = 'pulling';
        
        return {
      target: targetName,
        action(){
          ctx.message = '';
        
        },
      };
        }
    if (ctx.cyclist.id == ctx.first.id) {
      return {
        target: 'first',
        action(){},
        };
    }
   },
  },
  first: {
    actions: {
      onEnter(ctx) {},
      onExit(ctx) {},
      onExecute(ctx) {
      ctx.cyclist.computeForces_0(ctx.first);
      },
    },
    computeTransition(ctx){
    if (ctx.first.id != ctx.cyclist.id)
      return {
        target: 'init',
        action(){}
        };
    
    }
  },
    pulling: {
      actions: {
        onEnter(ctx){print('tirando');},
        onExit(ctx){},
        onExecute(ctx){
          if (tirando.includes(ctx.cyclist)) {
           ctx.cyclist.computeForces_0(ctx.first);
          
          }

        
        }
        
        },
      computeTransition(ctx){
        }
      
  },
    
    preparePulling: {
      actions: {
        onEnter(ctx){
          print('prepare');
        ctx.cyclist.preparePulling= null;
        },
        onExit(ctx){
    print('prepared');   
          ctx.cyclist.preparePulling = null;
        },
        onExecute(ctx) {
          if (tirando.includes(ctx.cyclist)) return;
          
          
          if (ctx.first.id == ctx.cyclist.id) {
           print('first')
            tirando.push(ctx.cyclist);
            
            } else {
              
              
          ctx.cyclist._mGoodPosition = 0;
          ctx.cyclist.computeForces_2(ctx.first);
          
          }
        }
        
        },
      computeTransition(ctx){
        if (tirando.includes(ctx.cyclist))
        return {
          target: 'pulling',
          action(){}
        };
      }
      
  },
});
}