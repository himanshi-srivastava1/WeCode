import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { getWebContainer } from '@/lib/webcontainer';
import 'xterm/css/xterm.css';

const TerminalComponent = forwardRef((props, ref) => {
  const terminalRef = useRef(null);
  const containerRef = useRef(null);
  const isInitialized = useRef(false);
  const shellInputWriter = useRef(null);

  // Expose a method to write commands into the shell from parent
  useImperativeHandle(ref, () => ({
    writeCommand: (command) => {
      if (shellInputWriter.current) {
        shellInputWriter.current.write(command + '\n');
      }
    },
  }));

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const term = new Terminal({
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
      },
      convertEol: true,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    const setupTerminal = async () => {
      term.open(terminalRef.current);
      
      // Delay initial fit to ensure DOM and CSS transitions are settled
      setTimeout(() => {
        fitAddon.fit();
      }, 100);

      term.write('Initializing WebContainer...\r\n');

      try {
        const webcontainerInstance = await getWebContainer();
        const shellProcess = await webcontainerInstance.spawn('jsh', {
          terminal: {
            cols: term.cols,
            rows: term.rows,
          },
        });

        shellProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              term.write(data);
            },
          })
        );

        const inputWriter = shellProcess.input.getWriter();
        shellInputWriter.current = inputWriter;

        term.onData((data) => {
          inputWriter.write(data);
        });

        // Robust Resize Handling:
        // Use ResizeObserver to detect when the ResizablePanel changes size
        const resizeObserver = new ResizeObserver(() => {
          fitAddon.fit();
          shellProcess.resize({
            cols: term.cols,
            rows: term.rows,
          });
        });

        if (containerRef.current) {
          resizeObserver.observe(containerRef.current);
        }

        return () => {
          resizeObserver.disconnect();
          term.dispose();
        };
      } catch (error) {
        term.write(`\r\n\x1b[31mError: ${error.message}\x1b[0m`);
      }
    };

    setupTerminal();
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full bg-[#1e1e1e] p-2 rounded-b-lg overflow-hidden"
    >
      <div ref={terminalRef} className="w-full h-full" />
    </div>
  );
});

TerminalComponent.displayName = 'TerminalComponent';

export default TerminalComponent;