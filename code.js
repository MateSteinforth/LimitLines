// Figma plugin to limit the pen tool to a fixed number of strokes

figma.showUI(__html__, { width: 200, height: 250 });

const maxStrokes = 10; // Adjust this value for the stroke limit
let remainingStrokes = maxStrokes;

// Ensure the UI is updated initially
figma.ui.postMessage({ type: 'update-counter', remainingStrokes });

// Disable drawing once the stroke limit is reached
function disableDrawing() {
  figma.currentPage.children.forEach(node => {
    if (node.type === 'VECTOR') {
      node.locked = true;
    }
  });
}

// Monitor for new strokes being added to the canvas
figma.on('documentchange', changes => {
  changes.documentChanges.forEach(change => {
    if (change.type === 'CREATE' && change.node && change.node.type === 'VECTOR') {
      console.log('New vector created:', change.node);
      if (remainingStrokes > 0) {
        remainingStrokes -= 1;
        figma.ui.postMessage({ type: 'update-counter', remainingStrokes });
      }
      if (remainingStrokes <= 0) {
        figma.notify('You have reached the stroke limit!');
        // Prevent further vectors from being added
        if (change.node && change.node.type === 'VECTOR') {
          change.node.remove();
        }
        disableDrawing();
      }
    }
  });
});

figma.ui.onmessage = msg => {
  if (msg.type === 'reset') {
    remainingStrokes = maxStrokes;
    figma.ui.postMessage({ type: 'update-counter', remainingStrokes });
    // Unlock all vector nodes on reset
    figma.currentPage.children.forEach(node => {
      if (node.type === 'VECTOR') {
        node.locked = false;
      }
    });
  }
};
