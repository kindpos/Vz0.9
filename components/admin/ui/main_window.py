"""
Main application window - Welcome screen
"""
from PyQt5.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                             QPushButton, QLabel, QFrame)
from PyQt5.QtCore import Qt
from PyQt5.QtGui import QFont, QFontDatabase, QPixmap


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("KINDpos Admin - Menu Setup")
        self.setGeometry(100, 100, 1000, 700)

        # Load custom fonts
        self.load_fonts()

        # Set window background color
        self.setStyleSheet("background-color: #333333;")

        self.init_ui()

    def load_fonts(self):
        """Load custom fonts from resources"""
        # Load Alien Encounters for titles
        alien_font_id = QFontDatabase.addApplicationFont("resources/fonts/Alien-Encounters-Solid-Bold.ttf")
        if alien_font_id != -1:
            self.alien_font_family = QFontDatabase.applicationFontFamilies(alien_font_id)[0]
        else:
            print("Warning: Could not load Alien Encounters font")
            self.alien_font_family = "Arial"  # Fallback

        # Load Sevastopol for body text
        sevastopol_font_id = QFontDatabase.addApplicationFont("resources/fonts/Sevastopol Interface.ttf")
        if sevastopol_font_id != -1:
            self.sevastopol_font_family = QFontDatabase.applicationFontFamilies(sevastopol_font_id)[0]
        else:
            print("Warning: Could not load Sevastopol Interface font")
            self.sevastopol_font_family = "Arial"  # Fallback

    def init_ui(self):
        """Initialize the user interface"""
        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # Main layout
        main_layout = QVBoxLayout()
        main_layout.setSpacing(5)
        main_layout.setContentsMargins(50, 30, 50, 50)

        # Logo
        logo = self.create_logo()
        main_layout.addWidget(logo, alignment=Qt.AlignmentFlag.AlignCenter)

        # Subtitle
        subtitle = QLabel("We'll help you set up your menu in about 20-30 minutes.")
        subtitle.setFont(QFont(self.sevastopol_font_family, 30))
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        subtitle.setStyleSheet("color: #FBDE42;")
        main_layout.addWidget(subtitle)

        # Note
        note = QLabel("You can save and come back anytime.")
        note.setFont(QFont(self.sevastopol_font_family, 30))
        note.setAlignment(Qt.AlignmentFlag.AlignCenter)
        note.setStyleSheet("color: #FBDE42; opacity: 0.7;")
        main_layout.addWidget(note)

        # Spacer
        main_layout.addSpacing(5)

        # Option cards
        cards_layout = QHBoxLayout()
        cards_layout.setSpacing(20)

        # Wizard card
        wizard_card = self.create_option_card(
            "Guided Wizard",
            "Step-by-step setup with help along the way.",
            "Perfect if this is your first time.",
            "Start Wizard",
            self.start_wizard
        )
        cards_layout.addWidget(wizard_card)

        # Import card
        import_card = self.create_option_card(
            "Import from Template",
            "Already have your menu in our Excel/Sheets template?",
            "Upload and we'll import everything!",
            "Upload Template",
            self.start_import
        )
        cards_layout.addWidget(import_card)

        main_layout.addLayout(cards_layout)

        # Spacer
        main_layout.addStretch()

        # Footer tip
        tip = QLabel("Not sure? Use the wizard - you can always export to template later!")
        tip.setFont(QFont(self.sevastopol_font_family, 25))
        tip.setAlignment(Qt.AlignmentFlag.AlignCenter)
        tip.setStyleSheet("color: #C6FFBB;")
        main_layout.addWidget(tip)

        central_widget.setLayout(main_layout)

    def create_logo(self):
        """Create the logo header"""
        logo_label = QLabel()
        pixmap = QPixmap("resources/images/logo.jpg")

        # Scale to medium size (adjust these numbers as needed)
        scaled_pixmap = pixmap.scaled(500, 200, Qt.AspectRatioMode.KeepAspectRatio,
                                      Qt.TransformationMode.SmoothTransformation)
        logo_label.setPixmap(scaled_pixmap)

        return logo_label

    def create_option_card(self, title, description, note, button_text, callback):
        """Create an option card"""
        # Card frame
        card = QFrame()
        card.setFrameShape(QFrame.Shape.Box)
        card.setStyleSheet("""
            QFrame {
                background-color: #C6FFBB;
                border: none;
                border-radius: 15px;
                padding: 10px;
            }
        """)
        card.setFixedWidth(450)
        card.setFixedHeight(320)

        layout = QVBoxLayout()
        layout.setSpacing(2)

        # Title
        title_label = QLabel(title)
        title_label.setFont(QFont(self.alien_font_family, 30))
        title_label.setStyleSheet("color: #333333;")
        title_label.setWordWrap(True)

        # Description
        desc_label = QLabel(description)
        desc_label.setFont(QFont(self.sevastopol_font_family, 25))
        desc_label.setWordWrap(True)
        desc_label.setStyleSheet("color: #333333;")

        # Note
        note_label = QLabel(note)
        note_label.setFont(QFont(self.sevastopol_font_family, 25))
        note_label.setWordWrap(True)
        note_label.setStyleSheet("color: #333333; opacity: 0.8;")

        # Button
        button = QPushButton(button_text)
        button.setFont(QFont(self.sevastopol_font_family, 20))
        button.setMinimumHeight(45)
        button.setCursor(Qt.CursorShape.PointingHandCursor)
        button.setStyleSheet("""
            QPushButton {
                background-color: #333333;
                color: #C6FFBB;
                border: none;
                border-radius: 10px;
                padding: 12px;
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

        # Add to layout
        layout.addWidget(title_label)
        layout.addWidget(desc_label)
        layout.addWidget(note_label)
        layout.addStretch()
        layout.addWidget(button)

        card.setLayout(layout)
        return card

    def start_wizard(self):
        """Start the setup wizard"""
        print("Starting wizard...")  # Placeholder
        # TODO: Open wizard

    def start_import(self):
        """Start the import process"""
        from ui.import_wizard import ImportWizard
        self.import_wizard = ImportWizard(parent=self)
        self.import_wizard.show()
        self.hide()  # Add this back - hide the welcome screen
