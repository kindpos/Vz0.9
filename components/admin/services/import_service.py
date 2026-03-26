"""
Import Service - Parse Excel/CSV templates
"""
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional, Tuple


class ImportService:
    """Handles parsing and validation of menu templates"""

    def __init__(self, file_path: str):
        self.file_path = Path(file_path)
        self.excel_file = None
        self.data = {}
        self.errors = []
        self.warnings = []

    def parse(self) -> Tuple[bool, Dict, List[str], List[str]]:
        """
        Parse the template file
        Returns: (success, data_dict, errors, warnings)
        """
        try:
            # Load Excel file
            self.excel_file = pd.ExcelFile(self.file_path)

            # Parse each sheet
            self._parse_restaurant_info()
            self._parse_tax_rules()
            self._parse_categories()
            self._parse_modifiers()
            self._parse_items()
            self._parse_discounts()

            # Check for critical errors
            if self.errors:
                return False, self.data, self.errors, self.warnings

            return True, self.data, self.errors, self.warnings

        except Exception as e:
            self.errors.append(f"Failed to read file: {str(e)}")
            return False, {}, self.errors, self.warnings

    def _parse_restaurant_info(self):
        """Parse RESTAURANT INFO sheet"""
        try:
            df = pd.read_excel(self.excel_file, sheet_name='RESTAURANT INFO')

            # Convert to dictionary (Field Name -> Value)
            info = {}
            for _, row in df.iterrows():
                field = row['Field Name']
                value = row['Value']

                if pd.notna(field) and pd.notna(value):
                    # Clean field name (remove asterisks)
                    clean_field = str(field).replace('*', '').strip()
                    info[clean_field] = str(value).strip()

            # Validate required fields
            required = ['Restaurant Name', 'Address', 'City', 'State', 'ZIP Code']
            for field in required:
                if field not in info or not info[field]:
                    self.errors.append(f"Missing required field: {field}")

            self.data['restaurant_info'] = info

        except Exception as e:
            self.errors.append(f"Error parsing Restaurant Info: {str(e)}")

    def _parse_tax_rules(self):
        """Parse TAX RULES sheet"""
        try:
            df = pd.read_excel(self.excel_file, sheet_name='TAX RULES')

            # Remove example rows
            df = df[~df['Tax Name*'].str.contains('Example', na=False)]

            # Remove empty rows
            df = df.dropna(subset=['Tax Name*'])

            tax_rules = []
            for _, row in df.iterrows():
                tax_rule = {
                    'name': str(row['Tax Name*']).strip(),
                    'type': str(row['Tax Type*']).strip() if pd.notna(row['Tax Type*']) else 'Sales Tax',
                    'rate': float(row['Rate (%)*']) if pd.notna(row['Rate (%)*']) else 0.0,
                    'applies_to': str(row['Applies To*']).strip() if pd.notna(
                        row['Applies To*']) else 'All Taxable Items',
                    'dine_in': str(row['Dine-In']).upper() == 'Y' if pd.notna(row['Dine-In']) else True,
                    'takeout': str(row['Takeout']).upper() == 'Y' if pd.notna(row['Takeout']) else True,
                    'delivery': str(row['Delivery']).upper() == 'Y' if pd.notna(row['Delivery']) else True,
                    'notes': str(row['Notes']).strip() if pd.notna(row['Notes']) else ''
                }
                tax_rules.append(tax_rule)

            if not tax_rules:
                self.warnings.append("No tax rules defined - will use 0% tax")

            self.data['tax_rules'] = tax_rules

        except Exception as e:
            self.errors.append(f"Error parsing Tax Rules: {str(e)}")

    def _parse_categories(self):
        """Parse CATEGORIES sheet"""
        try:
            df = pd.read_excel(self.excel_file, sheet_name='CATEGORIES')

            # Remove empty rows
            df = df.dropna(subset=['Category Name*'])

            categories = []
            for _, row in df.iterrows():
                category = {
                    'name': str(row['Category Name*']).strip(),
                    'display_order': int(row['Display Order*']) if pd.notna(row['Display Order*']) else 999,
                    'color': str(row['Color Code']).strip() if pd.notna(row['Color Code']) else '#CCCCCC',
                    'tax_category': str(row['Tax Category*']).strip() if pd.notna(row['Tax Category*']) else None,
                    'description': str(row['Description']).strip() if pd.notna(row['Description']) else '',
                    'active': str(row['Active']).upper() == 'Y' if pd.notna(row['Active']) else True
                }
                categories.append(category)

            if not categories:
                self.errors.append("No categories defined - at least one category is required")

            # Sort by display order
            categories.sort(key=lambda x: x['display_order'])

            self.data['categories'] = categories

        except Exception as e:
            self.errors.append(f"Error parsing Categories: {str(e)}")

    def _parse_modifiers(self):
        """Parse MODIFIERS sheet (complex multi-section structure)"""
        try:
            # Read entire sheet without headers
            df = pd.read_excel(self.excel_file, sheet_name='MODIFIERS', header=None)

            modifiers_data = {
                'master_list': [],
                'option_templates': [],
                'groups': [],
                'category_assignments': []
            }

            # For now, just parse what we can and skip errors
            # The pizza menu has a simplified modifier sheet anyway

            self.data['modifiers'] = modifiers_data
            self.warnings.append("Modifier parsing simplified - full implementation pending")

        except Exception as e:
            # Don't fail on modifier errors - they're optional
            self.warnings.append(f"Could not parse Modifiers sheet: {str(e)}")
            self.data['modifiers'] = {
                'master_list': [],
                'option_templates': [],
                'groups': [],
                'category_assignments': []
            }
    def _parse_items(self):
        """Parse ITEMS sheet"""
        try:
            df = pd.read_excel(self.excel_file, sheet_name='ITEMS')

            # Remove empty rows
            df = df.dropna(subset=['Item Name*'])

            items = []
            for _, row in df.iterrows():
                item = {
                    'name': str(row['Item Name*']).strip(),
                    'category': str(row['Category*']).strip(),
                    'price': float(row['Price*']) if pd.notna(row['Price*']) else 0.0,
                    'description': str(row['Description']).strip() if pd.notna(row['Description']) else '',
                    'tax': str(row['Tax']).strip() if pd.notna(row['Tax']) else 'AUTO',
                    'modifier_groups': str(row['Modifier Groups']).strip() if pd.notna(
                        row['Modifier Groups']) else 'AUTO',
                    'sku': str(row['SKU']).strip() if pd.notna(row['SKU']) else '',
                    'active': str(row['Active']).upper() == 'Y' if pd.notna(row['Active']) else True,
                    'prep_time': int(row['Prep Time (min)']) if pd.notna(row['Prep Time (min)']) else 0,
                    'allergens': str(row['Allergens']).strip() if pd.notna(row['Allergens']) else '',
                    'notes': str(row['Notes']).strip() if pd.notna(row['Notes']) else ''
                }
                items.append(item)

            if not items:
                self.warnings.append("No menu items defined")

            self.data['items'] = items

        except Exception as e:
            self.errors.append(f"Error parsing Items: {str(e)}")

    def _parse_discounts(self):
        """Parse DISCOUNTS sheet"""
        try:
            df = pd.read_excel(self.excel_file, sheet_name='DISCOUNTS')

            # Remove example rows
            df = df[~df['Discount Name*'].str.contains('Example', na=False)]

            # Remove empty rows
            df = df.dropna(subset=['Discount Name*'])

            discounts = []
            for _, row in df.iterrows():
                discount = {
                    'name': str(row['Discount Name*']).strip(),
                    'type': str(row['Type*']).strip(),
                    'amount': float(row['Amount*']) if pd.notna(row['Amount*']) else 0.0,
                    'schedule': str(row['Schedule']).strip() if pd.notna(row['Schedule']) else 'Always',
                    'applies_to': str(row['Applies To']).strip() if pd.notna(row['Applies To']) else 'Entire Check',
                    'restrictions': str(row['Restrictions']).strip() if pd.notna(row['Restrictions']) else '',
                    'requires_approval': str(row['Requires Approval']).upper() == 'YES' if pd.notna(
                        row['Requires Approval']) else False,
                    'reason_code_required': str(row['Reason Code Required']).upper() == 'YES' if pd.notna(
                        row['Reason Code Required']) else False,
                    'active': str(row['Active']).upper() == 'YES' if pd.notna(row['Active']) else True,
                    'notes': str(row['Notes']).strip() if pd.notna(row['Notes']) else ''
                }
                discounts.append(discount)

            self.data['discounts'] = discounts

        except Exception as e:
            self.errors.append(f"Error parsing Discounts: {str(e)}")

    def get_summary(self) -> Dict:
        """Get summary of imported data"""
        return {
            'restaurant_name': self.data.get('restaurant_info', {}).get('Restaurant Name', 'Unknown'),
            'tax_rules_count': len(self.data.get('tax_rules', [])),
            'categories_count': len(self.data.get('categories', [])),
            'items_count': len(self.data.get('items', [])),
            'discounts_count': len(self.data.get('discounts', [])),
            'has_errors': len(self.errors) > 0,
            'has_warnings': len(self.warnings) > 0
        }