"""
Import Template Wizard
Handles Excel/Google Sheets template import
"""
from PyQt5.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
                             QLabel, QFileDialog, QProgressBar,
                             QFrame, QApplication)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont, QFontDatabase
import pandas as pd
from pathlib import Path


class ImportWizard(QWidget):
    def __init__(self, parent=None):
        super().__init__()  # Don't pass parent here
        self.parent_window = parent  # Store parent separately

        self.setWindowTitle("Import Menu Template - KINDpos")

        # Center on screen
        from PyQt5.QtWidgets import QApplication
        screen = QApplication.desktop().screenGeometry()
        x = (screen.width() - 900) // 2
        y = (screen.height() - 650) // 2
        self.setGeometry(x, y, 900, 650)

        # Load fonts
        self.load_fonts()

        # Set styling
        self.setStyleSheet("background-color: #333333;")

        # Store imported data
        self.imported_data = None

        self.init_ui()

    def load_fonts(self):
        """Load custom fonts"""
        alien_font_id = QFontDatabase.addApplicationFont("resources/fonts/Alien-Encounters-Solid-Bold.ttf")
        if alien_font_id != -1:
            self.alien_font_family = QFontDatabase.applicationFontFamilies(alien_font_id)[0]
        else:
            self.alien_font_family = "Arial"

        sevastopol_font_id = QFontDatabase.addApplicationFont("resources/fonts/Sevastopol Interface.ttf")
        if sevastopol_font_id != -1:
            self.sevastopol_font_family = QFontDatabase.applicationFontFamilies(sevastopol_font_id)[0]
        else:
            self.sevastopol_font_family = "Arial"

    def init_ui(self):
        """Initialize UI"""
        main_layout = QVBoxLayout()
        main_layout.setSpacing(30)
        main_layout.setContentsMargins(50, 40, 50, 40)

        # Header
        header = QLabel("Import Menu Template")
        header.setFont(QFont(self.alien_font_family, 24))
        header.setStyleSheet("color: #FBDE42;")
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(header)

        # Instructions
        instructions = QLabel("Select your completed KINDpos menu template file")
        instructions.setFont(QFont(self.sevastopol_font_family, 20))
        instructions.setStyleSheet("color: #FBDE42;")
        instructions.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(instructions)

        # File selection card
        file_card = self.create_file_selection_card()
        main_layout.addWidget(file_card, alignment=Qt.AlignmentFlag.AlignCenter)

        # Spacer
        main_layout.addStretch()

        # Bottom buttons
        button_layout = QHBoxLayout()
        button_layout.setSpacing(20)

        back_btn = self.create_button("← MAIN MENU", self.go_back)
        button_layout.addWidget(back_btn)

        button_layout.addStretch()

        main_layout.addLayout(button_layout)

        self.setLayout(main_layout)

    def create_file_selection_card(self):
        """Create the file selection area"""
        card = QFrame()
        card.setStyleSheet("""
            QFrame {
                background-color: #333333;
                border: 3px dashed #C6FFBB;
                border-radius: 15px;
                padding: 40px;
            }
        """)
        card.setFixedSize(600, 300)

        layout = QVBoxLayout()
        layout.setSpacing(20)

        # Instructions
        text = QLabel("Click to browse or drag & drop your file here")
        text.setFont(QFont(self.sevastopol_font_family, 25))
        text.setStyleSheet("color: #333333;")
        text.setAlignment(Qt.AlignmentFlag.AlignBottom)
        text.setWordWrap(True)
        layout.addWidget(text)

        # Supported formats
        formats = QLabel("Supported: .xlsx, .xls, .csv")
        formats.setFont(QFont(self.sevastopol_font_family, 10))
        formats.setStyleSheet("color: #333333; opacity: 0.7;")
        formats.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(formats)

        # Browse button
        browse_btn = self.create_button("Browse Files", self.browse_file)
        layout.addWidget(browse_btn, alignment=Qt.AlignmentFlag.AlignCenter)

        card.setLayout(layout)

        # Make card clickable
        card.mousePressEvent = lambda event: self.browse_file()

        return card

    def create_button(self, text, callback):
        """Create a styled button"""
        button = QPushButton(text)
        button.setFont(QFont(self.sevastopol_font_family, 25))
        button.setMinimumHeight(45)
        button.setMinimumWidth(180)
        button.setCursor(Qt.CursorShape.PointingHandCursor)
        button.setStyleSheet("""
            QPushButton {
                background-color: #C6FFBB;
                color: #333333;
                border: none;
                border-radius: 10px;
                padding: 12px 20px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #444444;
            }
            QPushButton:pressed {
                background-color: #222222;
            }
        """)
        button.clicked.connect(callback)
        return button

    def browse_file(self):
        """Open file browser dialog"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Select Menu Template",
            str(Path.home()),
            "Spreadsheet Files (*.xlsx *.xls *.csv);;All Files (*.*)"
        )

        if file_path:
            self.process_file(file_path)

    def process_file(self, file_path):
        """Process the selected file"""
        # Show loading screen
        self.show_loading_screen(file_path)

        # TODO: Actually parse the file
        # For now, just simulate
        print(f"Processing file: {file_path}")

    def show_loading_screen(self, file_path):
        """Show loading/parsing screen"""
        # Clear current layout
        self.clear_layout()

        main_layout = QVBoxLayout()
        main_layout.setSpacing(30)
        main_layout.setContentsMargins(50, 40, 50, 40)

        # Header
        header = QLabel("Processing Template...")
        header.setFont(QFont(self.alien_font_family, 30))
        header.setStyleSheet("color: #FBDE42;")
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(header)

        # File name
        file_name = QLabel(f"File: {Path(file_path).name}")
        file_name.setFont(QFont(self.sevastopol_font_family, 20))
        file_name.setStyleSheet("color: #FBDE42;")
        file_name.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(file_name)

        main_layout.addSpacing(40)

        # Progress area
        progress_card = QFrame()
        progress_card.setStyleSheet("""
            QFrame {
                background-color: #C6FFBB;
                border: none;
                border-radius: 15px;
                padding: 30px;
            }
        """)
        progress_card.setFixedSize(600, 300)

        progress_layout = QVBoxLayout()
        progress_layout.setSpacing(15)

        # Progress items
        steps = [
            "✓ Reading file...",
            "✓ Validating restaurant info...",
            "✓ Processing categories...",
            "✓ Loading modifiers...",
            "⏳ Importing menu items...",
        ]

        for step in steps:
            step_label = QLabel(step)
            step_label.setFont(QFont(self.sevastopol_font_family, 12))
            step_label.setStyleSheet("color: #333333;")
            progress_layout.addWidget(step_label)

        progress_card.setLayout(progress_layout)
        main_layout.addWidget(progress_card, alignment=Qt.AlignmentFlag.AlignCenter)

        main_layout.addStretch()

        # Progress bar
        progress_bar = QProgressBar()
        progress_bar.setStyleSheet("""
            QProgressBar {
                border: 2px solid #333333;
                border-radius: 8px;
                background-color: #C6FFBB;
                height: 25px;
                text-align: center;
                color: #333333;
                font-weight: bold;
            }
            QProgressBar::chunk {
                background-color: #FBDE42;
                border-radius: 6px;
            }
        """)
        progress_bar.setValue(75)  # Simulated progress
        main_layout.addWidget(progress_bar)

        self.setLayout(main_layout)

        # TODO: Actually parse file and show preview
        # For now, just simulate with timer

    def clear_layout(self):
        """Clear the current layout"""
        old_layout = self.layout()
        if old_layout is not None:
            while old_layout.count():
                child = old_layout.takeAt(0)
                if child.widget():
                    child.widget().deleteLater()
            # Don't delete the layout itself, just clear it
            QWidget().setLayout(old_layout)

    def go_back(self):
        """Return to welcome screen"""
        if self.parent_window:  # Use stored reference
            self.parent_window.show()
        self.close()

    def process_file(self, file_path):
        """Process the selected file"""
        # Show loading screen
        self.show_loading_screen(file_path)

        # Parse the file
        from services.import_service import ImportService

        parser = ImportService(file_path)

        print("\n" + "=" * 70)
        print("PARSING TEMPLATE FILE")
        print("=" * 70)

        success, data, errors, warnings = parser.parse()

        print(f"\n✓ Parse complete!")
        print(f"  Success: {success}")
        print(f"  Errors: {len(errors)}")
        print(f"  Warnings: {len(warnings)}")

        if errors:
            print("\n❌ ERRORS:")
            for error in errors:
                print(f"  • {error}")

        if warnings:
            print("\n⚠️  WARNINGS:")
            for warning in warnings:
                print(f"  • {warning}")

        if success:
            summary = parser.get_summary()
            print(f"\n📊 SUMMARY:")
            print(f"  Restaurant: {summary['restaurant_name']}")
            print(f"  Categories: {summary['categories_count']}")
            print(f"  Items: {summary['items_count']}")
            print(f"  Tax Rules: {summary['tax_rules_count']}")
            print(f"  Discounts: {summary['discounts_count']}")
            print("\n" + "=" * 70 + "\n")

            self.imported_data = data
            self.show_preview_screen(parser)
        else:
            print("\n" + "=" * 70 + "\n")
            self.show_error_screen(errors, warnings)

    def show_preview_screen(self, parser):
        """Show detailed preview of imported data"""
        self.clear_layout()

        main_layout = QVBoxLayout()
        main_layout.setSpacing(20)
        main_layout.setContentsMargins(50, 40, 50, 40)

        # Header
        header = QLabel("IMPORT PREVIEW - SUCCESS!")
        header.setFont(QFont(self.alien_font_family, 24))
        header.setStyleSheet("color: #C6FFBB;")
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(header)

        # Get summary
        summary = parser.get_summary()
        data = parser.data

        # Create scrollable area for details
        from PyQt5.QtWidgets import QScrollArea
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setStyleSheet("background-color: #444444; border: none; border-radius: 10px;")

        scroll_content = QWidget()
        scroll_layout = QVBoxLayout()
        scroll_layout.setSpacing(15)

        # Restaurant Info
        rest_info = data.get('restaurant_info', {})
        info_text_content = "\nRESTAURANT INFORMATION\n"
        info_text_content += "=" * 50 + "\n"
        info_text_content += "Name: " + str(rest_info.get('Restaurant Name', 'N/A')) + "\n"
        info_text_content += "Address: " + str(rest_info.get('Address', 'N/A')) + ", "
        info_text_content += str(rest_info.get('City', 'N/A')) + ", "
        info_text_content += str(rest_info.get('State', 'N/A')) + " "
        info_text_content += str(rest_info.get('ZIP Code', 'N/A')) + "\n"
        info_text_content += "Type: " + str(rest_info.get('Restaurant Type', 'N/A')) + "\n"
        info_text_content += "Serves Alcohol: " + str(rest_info.get('Serves Alcohol', 'N/A')) + "\n"

        info_text = QLabel(info_text_content)
        info_text.setFont(QFont(self.sevastopol_font_family, 11))
        info_text.setStyleSheet("color: #FBDE42; padding: 15px;")
        info_text.setWordWrap(True)
        scroll_layout.addWidget(info_text)

        # Tax Rules
        tax_rules = data.get('tax_rules', [])
        tax_text = "\nTAX RULES (" + str(len(tax_rules)) + " configured)\n"
        tax_text += "=" * 50 + "\n"
        for tax in tax_rules[:5]:
            tax_text += "- " + str(tax['name']) + ": " + str(tax['rate']) + "% - " + str(tax['applies_to']) + "\n"
        if len(tax_rules) > 5:
            tax_text += "...and " + str(len(tax_rules) - 5) + " more\n"

        tax_label = QLabel(tax_text)
        tax_label.setFont(QFont(self.sevastopol_font_family, 11))
        tax_label.setStyleSheet("color: #FBDE42; padding: 15px;")
        tax_label.setWordWrap(True)
        scroll_layout.addWidget(tax_label)

        # Categories
        categories = data.get('categories', [])
        cat_text = "\nCATEGORIES (" + str(len(categories)) + " total)\n"
        cat_text += "=" * 50 + "\n"
        for cat in categories[:10]:
            cat_text += "- " + str(cat['name']) + " (Order: " + str(cat['display_order']) + ")\n"
        if len(categories) > 10:
            cat_text += "...and " + str(len(categories) - 10) + " more\n"

        cat_label = QLabel(cat_text)
        cat_label.setFont(QFont(self.sevastopol_font_family, 11))
        cat_label.setStyleSheet("color: #FBDE42; padding: 15px;")
        cat_label.setWordWrap(True)
        scroll_layout.addWidget(cat_label)

        # Items
        items = data.get('items', [])
        item_text = "\nMENU ITEMS (" + str(len(items)) + " total)\n"
        item_text += "=" * 50 + "\n"

        # Group by category
        items_by_cat = {}
        for item in items:
            cat = item['category']
            if cat not in items_by_cat:
                items_by_cat[cat] = []
            items_by_cat[cat].append(item)

        for cat_name, cat_items in items_by_cat.items():
            item_text += "\n" + str(cat_name) + ": " + str(len(cat_items)) + " items\n"
            for item in cat_items[:3]:
                price_str = "{:.2f}".format(item['price'])
                item_text += "  - " + str(item['name']) + " - $" + price_str + "\n"
            if len(cat_items) > 3:
                item_text += "  ...and " + str(len(cat_items) - 3) + " more\n"

        item_label = QLabel(item_text)
        item_label.setFont(QFont(self.sevastopol_font_family, 11))
        item_label.setStyleSheet("color: #FBDE42; padding: 15px;")
        item_label.setWordWrap(True)
        # Clear existing layout first
        if self.layout():
            QWidget().setLayout(self.layout())
        self.setLayout(main_layout)

        # Discounts
        discounts = data.get('discounts', [])
        if discounts:
            disc_text = "\nDISCOUNTS (" + str(len(discounts)) + " configured)\n"
            disc_text += "=" * 50 + "\n"
            for disc in discounts:
                amount_suffix = '%' if disc['type'] == 'Percentage' else '$'
                disc_text += "- " + str(disc['name']) + ": " + str(disc['amount']) + amount_suffix + " off\n"

            disc_label = QLabel(disc_text)
            disc_label.setFont(QFont(self.sevastopol_font_family, 11))
            disc_label.setStyleSheet("color: #FBDE42; padding: 15px;")
            disc_label.setWordWrap(True)
            scroll_layout.addWidget(disc_label)

        # Warnings section
        if parser.warnings:
            warn_text = "\nWARNINGS\n"
            warn_text += "=" * 50 + "\n"
            for warning in parser.warnings:
                warn_text += "- " + str(warning) + "\n"

            warn_label = QLabel(warn_text)
            warn_label.setFont(QFont(self.sevastopol_font_family, 10))
            warn_label.setStyleSheet("color: #FFD700; padding: 15px;")
            warn_label.setWordWrap(True)
            scroll_layout.addWidget(warn_label)

        scroll_content.setLayout(scroll_layout)
        scroll.setWidget(scroll_content)
        main_layout.addWidget(scroll)

        # Summary stats at bottom
        stats_text = "Ready to import: " + str(len(categories)) + " categories, "
        stats_text += str(len(items)) + " items, "
        stats_text += str(len(tax_rules)) + " tax rules, "
        stats_text += str(len(discounts)) + " discounts"

        stats_label = QLabel(stats_text)
        stats_label.setFont(QFont(self.sevastopol_font_family, 11))
        stats_label.setStyleSheet("color: #C6FFBB; background-color: #333333; padding: 10px; border-radius: 5px;")
        stats_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(stats_label)

        # Buttons
        button_layout = QHBoxLayout()

        back_btn = self.create_button("Back", self.go_back)
        import_btn = self.create_button("Confirm Import", self.confirm_import)

        button_layout.addWidget(back_btn)
        button_layout.addStretch()
        button_layout.addWidget(import_btn)

        main_layout.addLayout(button_layout)
        self.setLayout(main_layout)

    def show_error_screen(self, errors, warnings):
        """Show errors from parsing"""
        self.clear_layout()

        main_layout = QVBoxLayout()
        main_layout.setSpacing(20)
        main_layout.setContentsMargins(50, 40, 50, 40)

        # Header
        header = QLabel("IMPORT ERRORS")
        header.setFont(QFont(self.alien_font_family, 24))
        header.setStyleSheet("color: #FF3333;")
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(header)

        # Errors
        error_text = "ERRORS:\n" + "\n".join("- " + str(e) for e in errors)

        if warnings:
            error_text += "\n\nWARNINGS:\n" + "\n".join("- " + str(w) for w in warnings)

        error_label = QLabel(error_text)
        error_label.setFont(QFont(self.sevastopol_font_family, 11))
        error_label.setStyleSheet("color: #FBDE42; background-color: #444444; padding: 20px; border-radius: 10px;")
        error_label.setWordWrap(True)
        main_layout.addWidget(error_label)

        # Back button
        back_btn = self.create_button("Try Another File", self.init_ui)
        main_layout.addWidget(back_btn, alignment=Qt.AlignmentFlag.AlignCenter)

        self.setLayout(main_layout)

    def confirm_import(self):
        """User confirmed the import - generate events and save"""
        try:
            # Generate events from parsed data
            from services.event_generator import EventGenerator
            from services.event_store import EventStore

            generator = EventGenerator()
            events = generator.generate_from_import(self.imported_data)

            # Print to console
            print("\n" + "=" * 60)
            print(f"Generated {len(events)} events:")
            print("=" * 60)

            for i, event in enumerate(events, 1):
                print(f"\n{i}. {event.event_type}")
                print(f"   UUID: {event.event_uuid}")
                print(f"   Timestamp: {event.timestamp}")
                print(f"   Payload keys: {list(event.payload.keys())}")

            print("\n" + "=" * 60)

            # Save events to database
            print("\n📀 Saving events to database...")
            event_store = EventStore()
            success = event_store.save_events(events)

            if success:
                total_events = event_store.get_event_count()
                print(f"✓ Database now contains {total_events} total events")

            # Show success screen
            self.show_success_screen(events)

        except Exception as e:
            print(f"Error generating/saving events: {e}")
            import traceback
            traceback.print_exc()

    def show_success_screen(self, events):
        """Show success with event count"""
        self.clear_layout()

        main_layout = QVBoxLayout()
        main_layout.setSpacing(30)
        main_layout.setContentsMargins(50, 40, 50, 40)

        # Success message
        header = QLabel("✓ Import Successful!")
        header.setFont(QFont(self.alien_font_family, 32))
        header.setStyleSheet("color: #FBDE42;")
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(header)

        # Event count
        event_count = QLabel(f"{len(events)} events generated")
        event_count.setFont(QFont(self.sevastopol_font_family, 16))
        event_count.setStyleSheet("color: #FBDE42;")
        event_count.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(event_count)

        # Next step info
        next_label = QLabel("Next: Save to event ledger")
        next_label.setFont(QFont(self.sevastopol_font_family, 14))
        next_label.setStyleSheet("color: #C6FFBB;")
        next_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        main_layout.addWidget(next_label)

        main_layout.addStretch()

        # Close button
        close_btn = QPushButton("Close")
        close_btn.setFont(QFont(self.sevastopol_font_family, 14))
        close_btn.setStyleSheet("""
            QPushButton {
                background-color: #FF3333;
                color: white;
                border: none;
                padding: 10px 30px;
                border-radius: 5px;
            }
            QPushButton:hover {
                background-color: #CC0000;
            }
        """)
        close_btn.clicked.connect(self.close)
        main_layout.addWidget(close_btn, alignment=Qt.AlignmentFlag.AlignCenter)

        self.setLayout(main_layout)

    def closeEvent(self, event):
        """Handle window close event (X button)"""
        if self.parent_window:  # Use stored reference
            self.parent_window.show()
        event.accept()