from typing import List, Dict, Any
from .base_template import BaseTemplate

class KitchenTicketTemplate(BaseTemplate):
    """
    Template for Kitchen Tickets.
    Operational priorities: Order type banner, Allergen block, items by seat.
    """

    def render(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        commands = super().render(context)

        # 1. Order Type Banner (Spec 4.5)
        commands.extend(self._render_order_type_banner(context))

        # 2. Header Info
        header_line = f"TICKET: {context.get('ticket_number', 'N/A')}"
        if context.get('table'):
            header_line += f" | {context.get('table')}"
        commands.append({'type': 'text', 'content': header_line, 'bold': True})
        
        fired_at = self._format_time(context.get('fired_at'))
        commands.append({'type': 'text', 'content': f"Fired: {fired_at}"})
        commands.append({'type': 'divider'})

        # 3. Items
        for item in context.get('items', []):
            # Item Name (Bold)
            commands.append({'type': 'text', 'content': f"{item['name']}", 'bold': True})
            
            # Modifiers (Indented)
            for modifier in item.get('modifiers', []):
                commands.append({'type': 'text', 'content': f"  - {modifier}"})
                
            # Special Instructions / Allergen Block (Spec 4.6)
            spec_inst = item.get('special_instructions', '')
            if spec_inst:
                commands.extend(self._render_special_instructions(spec_inst))
            
            commands.append({'type': 'feed', 'lines': 1})

        commands.append({'type': 'cut', 'partial': False})
        return commands

    def _render_order_type_banner(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        order_type_display = context.get('order_type_display', context.get('order_type', 'ORDER')).upper()
        table_info = f" | {context.get('table')}" if context.get('table') else ""
        content = f"{order_type_display}{table_info}"
        
        divider = "-" * self.chars_per_line
        return [
            {'type': 'text', 'content': divider},
            {'type': 'text', 'content': content, 'bold': True, 'double_width': True, 'align': 'center'},
            {'type': 'text', 'content': divider},
            {'type': 'feed', 'lines': 1}
        ]

    def _render_special_instructions(self, instructions: str) -> List[Dict[str, Any]]:
        divider = "=" * self.chars_per_line
        wrapped = self._wrap_text(instructions, self.chars_per_line - 4)
        
        cmds = [{'type': 'text', 'content': divider}]
        for line in wrapped:
            cmds.append({'type': 'text', 'content': f"  {line}", 'bold': True})
        cmds.append({'type': 'text', 'content': divider})
        return cmds
