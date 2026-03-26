"""
KINDpos Admin - Menu Configuration Tool
Main entry point
"""
import sys
from PyQt5.QtWidgets import QApplication
from PyQt5.QtGui import QFont
from ui.main_window import MainWindow


def main():
    """Initialize and run the application"""
    app = QApplication(sys.argv)

    # Set application metadata
    app.setApplicationName("KINDpos Admin")
    app.setOrganizationName("KIND Technologies LLC")
    app.setApplicationVersion("1.0.0")

    # Set default font
    font = QFont("Segoe UI", 10)  # Use Arial on Mac/Linux if needed
    app.setFont(font)

    # Create and show main window
    window = MainWindow()
    window.show()

    sys.exit(app.exec())


if __name__ == '__main__':
    main()