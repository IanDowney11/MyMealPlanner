import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { MultiBackend, TouchTransition } from 'react-dnd-multi-backend';

// Configure multi-backend to handle both mouse and touch
const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: {
        dragDropManager: undefined,
        monitors: undefined
      }
    },
    {
      id: 'touch',
      backend: TouchBackend,
      options: {
        enableMouseEvents: true,
        delayTouchStart: 200,
        ignoreContextMenu: true
      },
      preview: true,
      transition: TouchTransition
    }
  ]
};

function DragDropProvider({ children }) {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      {children}
    </DndProvider>
  );
}

export default DragDropProvider;