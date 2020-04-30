import React, { useEffect } from "react";
import "./styles.css";
import create from "zustand";
import * as THREE from "three";
//TODO: create update functions that run every x seconds
// and check the state for various conditions (achievments, events, etc..)
const gameStates = {
  started: "started",
  paused: "paused",
  stopped: "stopped"
};

const [useGameStateStore] = create((set, get) => {
  return {
    isRunning: false,
    fps: 0,
    actions: {
      start() {
        if (!get().isRunning) {
          set(state => ({ isRunning: true }));
          get().mutation.clock.start();
          console.log("started", get().isRunning);
        }
      },
      stop() {
        if (get().isRunning) {
          set(state => ({ isRunning: false }));
          get().mutation.clock.stop();
          console.log("stopped", get().isRunning);
        }
      },
      pause() {
        set(state => ({ gameState: gameStates.paused }));
      },
      update(elapsedTime) {
        get().actions.updateFPS(elapsedTime);
      }
    },
    mutation: {
      clock: new THREE.Clock(false)
    }
  };
});

const [useResourcesStore] = create((set, get) => {
  return {
    resources: {
      fans: 0,
      hype: 0,
      energy: 10
    },
    actions: {
      updateResources: newResources =>
        set({ resources: newResources, ...get().actions })
    }
  };
});
const useResourceSystem = props => {
  const { resources, actions } = useResourcesStore();
  return {
    update() {
      actions.updateResources({
        ...resources,
        fans: resources.fans + 1,
        hype: resources.fans + 10
      });
    }
  };
};
debugger;
const useSystemManager = props => {
  const systems = React.useRef([]);
  const resourcesSystem = useResourceSystem();
  return {
    register(system) {
      systems.current = [...systems.current, system];
    },
    update() {
      resourcesSystem.update();
    }
  };
};
const useGameLoop = ({ isRunning }) => {
  const intervalRef = React.useRef();
  const { update } = useSystemManager();

  function handleEvents() {
    update();
  }
  function gameLoop() {
    handleEvents();
  }
  React.useEffect(() => {
    if (isRunning) intervalRef.current = setInterval(gameLoop, 200);
    return () => {
      clearInterval(intervalRef.current);
    };
  });
};

const StartButton = props => {
  const isRunning = useGameStateStore(state => state.isRunning);
  const { start } = useGameStateStore(state => state.actions);
  return (
    <button disabled={isRunning} onClick={start}>
      Start Game Loop
    </button>
  );
};
const StopButton = props => {
  const isRunning = useGameStateStore(state => state.isRunning);
  const { stop } = useGameStateStore(state => state.actions);
  return (
    <button disabled={!isRunning} onClick={stop}>
      Stop Game Loop
    </button>
  );
};
const Resources = props => {
  const { resources } = useResourcesStore();
  return (
    <div>
      <ul>
        {Object.keys(resources).map(key => (
          <li key={key}>
            {key}: {resources[key]}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Game = props => {
  const isRunning = useGameStateStore(state => state.isRunning);
  useGameLoop({ isRunning });
  return <div>{props.children}</div>;
};
export default function App() {
  return (
    <div className="App">
      <Game>
        <StopButton />
        <StartButton />
        <Resources />
      </Game>
    </div>
  );
}
