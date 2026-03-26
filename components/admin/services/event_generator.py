# services/event_generator.py

from typing import Dict, List, Any
from models.events import Event, EventTypes
import uuid


class EventGenerator:
    """Converts parsed import data into event objects"""

    def __init__(self):
        self.events: List[Event] = []
        self.import_id = None
        self.terminal_id = "admin-tool"
        self.user_id = "admin"

    def generate_from_import(self, parsed_data: Dict[str, Any]) -> List[Event]:
        """
        Generate all events from a parsed import

        Args:
            parsed_data: The dict returned by ImportService.parse()

        Returns:
            List of Event objects in chronological order
        """
        self.events = []
        self.import_id = f"import:{uuid.uuid4().hex[:8]}"

        # 1. Import started
        self._add_import_started(parsed_data)

        # 2. Restaurant configuration
        if 'restaurant_info' in parsed_data:
            self._add_restaurant_configured(parsed_data['restaurant_info'])

        # 3. Tax rules
        if 'tax_rules' in parsed_data:
            self._add_tax_rules(parsed_data['tax_rules'])

        # 4. Categories
        if 'categories' in parsed_data:
            self._add_categories(parsed_data['categories'])

        # 5. Items
        if 'items' in parsed_data:
            self._add_items(parsed_data['items'])

        # 6. Discounts
        if 'discounts' in parsed_data:
            self._add_discounts(parsed_data['discounts'])

        # 7. Import completed
        self._add_import_completed(parsed_data)

        return self.events

    def _add_import_started(self, data: Dict):
        """Create import started event"""
        rest_info = data.get('restaurant_info', {})

        event = Event(
            event_type=EventTypes.MENU_IMPORT_STARTED,
            aggregate_type="menu",
            aggregate_id=self.import_id,
            terminal_id=self.terminal_id,
            user_id=self.user_id,
            payload={
                'import_id': self.import_id,
                'restaurant_name': rest_info.get('Restaurant Name', 'Unknown')
            }
        )
        self.events.append(event)

    def _add_restaurant_configured(self, restaurant_info: Dict):
        """Create restaurant configuration event"""
        event = Event(
            event_type=EventTypes.RESTAURANT_CONFIGURED,
            aggregate_type="restaurant",
            aggregate_id="restaurant:main",
            terminal_id=self.terminal_id,
            user_id=self.user_id,
            payload={
                'import_id': self.import_id,
                'name': restaurant_info.get('Restaurant Name'),
                'address': restaurant_info.get('Address'),
                'city': restaurant_info.get('City'),
                'state': restaurant_info.get('State'),
                'zip_code': restaurant_info.get('ZIP Code'),
                'phone': restaurant_info.get('Phone'),
                'email': restaurant_info.get('Email'),
                'website': restaurant_info.get('Website'),
                'restaurant_type': restaurant_info.get('Restaurant Type'),
                'serves_alcohol': restaurant_info.get('Serves Alcohol')
            }
        )
        self.events.append(event)

    def _add_tax_rules(self, tax_rules: List[Dict]):
        """Create tax rules batch event"""
        event = Event(
            event_type=EventTypes.TAX_RULES_BATCH_CREATED,
            aggregate_type="menu",
            aggregate_id=self.import_id,
            terminal_id=self.terminal_id,
            user_id=self.user_id,
            payload={
                'import_id': self.import_id,
                'tax_rules': [
                    {
                        'tax_rule_id': f"tax:{rule.get('Tax Name', '').lower().replace(' ', '_')}",
                        'name': rule.get('Tax Name'),
                        'type': rule.get('Tax Type'),
                        'rate': rule.get('Rate (%)'),
                        'applies_to': rule.get('Applies To'),
                        'dine_in': rule.get('Dine-In') == 'Yes',
                        'takeout': rule.get('Takeout') == 'Yes',
                        'delivery': rule.get('Delivery') == 'Yes',
                        'notes': rule.get('Notes')
                    }
                    for rule in tax_rules
                ]
            }
        )
        self.events.append(event)

    def _add_categories(self, categories: List[Dict]):
        """Create categories batch event"""
        event = Event(
            event_type=EventTypes.CATEGORIES_BATCH_CREATED,
            aggregate_type="menu",
            aggregate_id=self.import_id,
            terminal_id=self.terminal_id,
            user_id=self.user_id,
            payload={
                'import_id': self.import_id,
                'categories': [
                    {
                        'category_id': f"cat:{cat.get('name', '').lower().replace(' ', '_')}",
                        'name': cat.get('name'),
                        'display_order': cat.get('display_order'),
                        'color': cat.get('color'),
                        'tax_category': cat.get('tax_category'),
                        'description': cat.get('description'),
                        'active': cat.get('active', True)
                    }
                    for cat in categories
                ]
            }
        )
        self.events.append(event)

    def _add_items(self, items: List[Dict]):
        """Create items batch event"""
        event = Event(
            event_type=EventTypes.ITEMS_BATCH_CREATED,
            aggregate_type="menu",
            aggregate_id=self.import_id,
            terminal_id=self.terminal_id,
            user_id=self.user_id,
            payload={
                'import_id': self.import_id,
                'items': [
                    {
                        'item_id': f"item:{item.get('name', '').lower().replace(' ', '_')}",
                        'name': item.get('name'),
                        'category': item.get('category'),
                        'category_id': f"cat:{item.get('category', '').lower().replace(' ', '_')}",
                        'price': item.get('price'),
                        'description': item.get('description'),
                        'tax_category': item.get('tax'),
                        'sku': item.get('sku'),
                        'active': item.get('active', True),
                        'prep_time_minutes': item.get('prep_time'),
                        'allergens': item.get('allergens', '').split(',') if item.get('allergens') else []
                    }
                    for item in items
                ]
            }
        )
        self.events.append(event)

    def _add_discounts(self, discounts: List[Dict]):
        """Create discounts batch event"""
        event = Event(
            event_type=EventTypes.DISCOUNTS_BATCH_CREATED,
            aggregate_type="menu",
            aggregate_id=self.import_id,
            terminal_id=self.terminal_id,
            user_id=self.user_id,
            payload={
                'import_id': self.import_id,
                'discounts': [
                    {
                        'discount_id': f"discount:{disc.get('name', '').lower().replace(' ', '_')}",
                        'name': disc.get('name'),
                        'type': disc.get('type'),
                        'amount': disc.get('amount'),
                        'schedule': disc.get('schedule'),
                        'applies_to': disc.get('applies_to'),
                        'restrictions': disc.get('restrictions'),
                        'requires_approval': disc.get('requires_approval', False),
                        'reason_code_required': disc.get('reason_code_required', False),
                        'active': disc.get('active', True)
                    }
                    for disc in discounts
                ]
            }
        )
        self.events.append(event)

    def _add_import_completed(self, data: Dict):
        """Create import completed event"""
        event = Event(
            event_type=EventTypes.MENU_IMPORT_COMPLETED,
            aggregate_type="menu",
            aggregate_id=self.import_id,
            terminal_id=self.terminal_id,
            user_id=self.user_id,
            payload={
                'import_id': self.import_id,
                'summary': {
                    'categories_created': len(data.get('categories', [])),
                    'items_created': len(data.get('items', [])),
                    'tax_rules_created': len(data.get('tax_rules', [])),
                    'discounts_created': len(data.get('discounts', []))
                }
            }
        )
        self.events.append(event)