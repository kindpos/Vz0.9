import logging
from typing import Dict, Any, List
try:
    from escpos.printer import Network, Serial, Usb, Dummy
except ImportError:
    # Handle environment where python-escpos might not be installed yet
    class Dummy: pass
    Network = Serial = Usb = Dummy

logger = logging.getLogger("kindpos.printing.escpos_formatter")

class ESCPOSFormatter:
    """
    Translates template commands into raw ESC/POS printer commands.
    Uses python-escpos library.
    """

    def __init__(self, paper_width: int = 80):
        self.paper_width = paper_width

    def format(self, commands: List[Dict[str, Any]]) -> bytes:
        """Process formatting commands and return raw bytes."""
        # Use a Dummy printer to capture the raw bytes
        try:
            p = Dummy()
            # Set codepage to PC858 (Latin 1 + Euro) or PC850
            # Volcora and most modern ESC/POS printers support PC858
            try:
                p.charcode('PC858')
            except:
                try:
                    p.charcode('PC850')
                except:
                    logger.warning("Could not set codepage to PC858 or PC850, falling back to default")
        except:
            return b"!! python-escpos not installed !!"

        for cmd in commands:
            cmd_type = cmd.get('type')
            
            if cmd_type == 'text':
                content = cmd.get('content', '')
                bold = cmd.get('bold', False)
                double_width = cmd.get('double_width', False)
                align = cmd.get('align', 'left') # left, center, right
                
                # Apply formatting
                p.set(align=align, bold=bold, width=2 if double_width else 1)
                p.text(f"{content}\n")
                
            elif cmd_type == 'feed':
                p.ln(cmd.get('lines', 1))
                
            elif cmd_type == 'divider':
                char = cmd.get('char', '-')
                p.text(char * (48 if self.paper_width == 80 else 32) + "\n")
                
            elif cmd_type == 'cut':
                p.cut()
                
            # Reset after each command for safety
            p.set(align='left', bold=False, width=1)
            
        return p.output
