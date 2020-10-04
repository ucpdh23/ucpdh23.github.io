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
        }else if (ctx.message === 'adelanta') {
          print("adelantando...");
        
          return {
            target: 'adelanta',
            action() {}
          };
        } else if (ctx.message === 'acelera') {
          ctx.cyclist.startSelfAcc = true;
          ctx.cyclist.selfAccLevel = 3;
        } else if (ctx.message === 'desacelera') {
          ctx.cyclist.startSelfAcc = true;
          ctx.cyclist.selfAccLevel = -3;
        } else if (typeof ctx.message == 'string' && ctx.message.startsWith('acelera#')) {
          var val = parseFloat(ctx.message.split('#')[1]);
          
          ctx.cyclist.startSelfAcc = true;
          ctx.cyclist.selfAccLevel = val;
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
      
      if (ctx.message === 'acelera') {
          ctx.cyclist.startSelfAcc = true;
          ctx.cyclist.selfAccLevel = 3;
        } else if (ctx.message === 'desacelera') {
          ctx.cyclist.startSelfAcc = true;
          ctx.cyclist.selfAccLevel = -3;
        } else if (typeof ctx.message == 'string' && ctx.message.startsWith('acelera#')) {
          var val = parseFloat(ctx.message.split('#')[1]);
          
          ctx.cyclist.startSelfAcc = true;
          ctx.cyclist.selfAccLevel = val;
        }
      
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
        //ctx.cyclist.preparePulling= null;
        ctx.cyclist._maxSteeringForce = ctx.cyclist.maxSteeringForce;
        ctx.cyclist.maxSteeringForce = ctx.cyclist.maxSteeringForce * 1.3;
        },
        onExit(ctx){
    print('prepared');   
         // ctx.cyclist.preparePulling = null;
          ctx.cyclist.maxSteeringForce = ctx.cyclist._maxSteeringForce;
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
        computeTransition(ctx) {
            if (ctx.cyclist._gotoFirst !== undefined && ctx.cyclist._gotoFirst === true) {
                ctx.cyclist._gotoFirst = false;

                return {
                    target: 'gotoFirst',
                    action() { }
                };
            } else if (tirando.includes(ctx.cyclist)) {
                return {
                    target: 'pulling',
                    action() { }
                };
            }
        }
    },
      gotoFirst: {
          actions: {
              onEnter(ctx) {
                  var diff = ctx.cyclist.velocity.x - ctx.first.velocity.x;

                  var acceleration = 1;
                  if (diff > 0.5) {
                      acceleration = 0.2
                  } else if (diff > 0.3) {
                      acceleration = 0.4
                  } else if (diff > 0.2) {
                      acceleration = 0.6
                  } else if (diff > 0.1) {
                      acceleraton = 0.8
                  }

                  ctx.cyclist._gotoFirstDefaultTime = ctx.cyclist.selfAccTimer;

                  ctx.cyclist.startSelfAcc = true;
                  ctx.cyclist.selfAccLevel = acceleration;
                  ctx.cyclist.selfAccTimer = 0.3;
              },
              onExit(ctx) {
                  ctx.cyclist.selfAccTimer = ctx.cyclist._gotoFirstDefaultTime;
              },
              onExecute(ctx) {
                  ctx.cyclist.computeForces_3(ctx.first);
              }
          },
          computeTransition(ctx) {
              if (ctx.cyclist.selfStartedSelfAcc === false) {
                  if (ctx.first.id === ctx.cyclist.id) {
                      tirando.push(ctx.cyclist);
                      return {
                          target: 'pulling',
                          action() { }
                      };
                  } else if (ctx.first.velocity.x < ctx.cyclist.velocity.x - 0.3) {
                      console.log("wait a while");
                  } else {
                    ctx.cyclist.startSelfAcc = true;
                  }
              }
          }
      },

   
  
  adelanta: {
      actions: {
        onEnter(ctx){
          print('adelanting');
        ctx.cyclist.preparePulling= null;
        ctx.cyclist.tmpMaxSpeed = ctx.cyclist.maxSpeed;
        ctx.cyclist.maxSpeed = ctx.first.velocity.mag() * 1.05;
        ctx.cyclist.tmpSeparation= ctx.cyclist._mSeparation;
        ctx.cyclist._mSeparation=1.3;
        
        },
        onExit(ctx){
    print('adelanted');   
          ctx.cyclist.preparePulling = null;
          ctx.cyclist.maxSpeed = ctx.cyclist.tmpMaxSpeed;
          ctx.cyclist._mSeparation = ctx.cyclist.tmpSeparation;
        },
        onExecute(ctx) {
          if (tirando.includes(ctx.cyclist)) return;
          
          
              
              
          ctx.cyclist._mGoodPosition = 6;
          ctx.cyclist.computeForces_2(ctx.first);
          

        }
        
        },
      computeTransition(ctx){
        if (ctx.first.position.x - ctx.cyclist.position.x < 6)
        return {
          target: 'init',
          action(){}
        };
      }
      
  },
});
}


function createPreparePulling(target) {
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
      if (ctx.message === 'tira') {
        var targetName = 'preparePulling';
        
        if (ctx.first.id === ctx.cyclist.id) targetName = 'pulling';
        
        return {
            target: targetName,
            action() {
                ctx.message = '';
            },
          };
      } else if (ctx.message === 'adelanta') {
          print("adelantando...");

          return {
            target: 'adelanta',
            action(){}
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
        ctx.cyclist.tmpMaxSpeed = ctx.cyclist.maxSpeed;
        ctx.cyclist.maxSpeed = ctx.first.velocity.mag() * 1.05;
        ctx.cyclist.tmpSeparation= ctx.cyclist._mSeparation;
        ctx.cyclist._mSeparation=1.3;
        
        },
        onExit(ctx){
    print('prepared');   
          ctx.cyclist.preparePulling = null;
          ctx.cyclist.maxSpeed = ctx.cyclist.tmpMaxSpeed;
          ctx.cyclist._mSeparation = ctx.cyclist.tmpSeparation;
        },
        onExecute(ctx) {
          if (tirando.includes(ctx.cyclist)) return;
          
          
          if (ctx.first.id == ctx.cyclist.id) {
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
  
  
  adelanta: {
      actions: {
        onEnter(ctx){
          print('adelanting');
        ctx.cyclist.preparePulling= null;
        ctx.cyclist.tmpMaxSpeed = ctx.cyclist.maxSpeed;
        ctx.cyclist.maxSpeed = ctx.first.velocity.mag() * 1.05;
        ctx.cyclist.tmpSeparation= ctx.cyclist._mSeparation;
        ctx.cyclist._mSeparation=1.3;
        
        },
        onExit(ctx){
    print('adelanted');   
          ctx.cyclist.preparePulling = null;
          ctx.cyclist.maxSpeed = ctx.cyclist.tmpMaxSpeed;
          ctx.cyclist._mSeparation = ctx.cyclist.tmpSeparation;
        },
        onExecute(ctx) {
          if (tirando.includes(ctx.cyclist)) return;
          
          
              
              
          ctx.cyclist._mGoodPosition = 6;
          ctx.cyclist.computeForces_2(ctx.first);
          

        }
        
        },
      computeTransition(ctx){
        if (ctx.first.position.x - ctx.cyclist.position.x < 6)
        return {
          target: 'init',
          action(){}
        };
      }
      
  },
});
}