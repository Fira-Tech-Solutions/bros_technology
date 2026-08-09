#!/usr/bin/env python3
"""Generate client handover PDF from documentation."""

import markdown
from pathlib import Path

DOCS_DIR = Path("/home/nox/projects/laptop_market/docs")
OUTPUT_DIR = Path("/home/nox/projects/laptop_market/docs-site")
OUTPUT_PDF = OUTPUT_DIR / "BROS_Technology_Handover.pdf"

# Client-facing documents in order
CLIENT_DOCS = [
    "00-OVERVIEW.md",
    "03-FEATURES.md",
    "05-DEPLOYMENT.md",
    "06-BRAND-AND-DESIGN-SYSTEM.md",
]

# CSS for PDF styling
CSS = """
@page {
    size: A4;
    margin: 2cm;
    @top-center {
        content: "BROS Technology — Project Handover";
        font-size: 9pt;
        color: #666;
    }
    @bottom-center {
        content: counter(page) " / " counter(pages);
        font-size: 9pt;
        color: #666;
    }
}

body {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a2e;
}

h1 {
    color: #1878B4;
    font-size: 24pt;
    border-bottom: 2px solid #1878B4;
    padding-bottom: 8pt;
    page-break-after: avoid;
}

h2 {
    color: #125E8C;
    font-size: 16pt;
    margin-top: 24pt;
    page-break-after: avoid;
}

h3 {
    color: #1878B4;
    font-size: 13pt;
    page-break-after: avoid;
}

table {
    width: 100%;
    border-collapse: collapse;
    margin: 12pt 0;
    font-size: 10pt;
}

th {
    background-color: #1878B4;
    color: white;
    padding: 8pt;
    text-align: left;
}

td {
    padding: 6pt 8pt;
    border-bottom: 1px solid #e0e0e0;
}

tr:nth-child(even) {
    background-color: #f5f5f5;
}

code {
    background-color: #f0f0f0;
    padding: 2pt 4pt;
    border-radius: 3pt;
    font-family: 'Roboto Mono', monospace;
    font-size: 9pt;
}

pre {
    background-color: #1a1a2e;
    color: #e0e0e0;
    padding: 12pt;
    border-radius: 6pt;
    overflow-x: auto;
    font-size: 9pt;
}

pre code {
    background: none;
    color: inherit;
    padding: 0;
}

blockquote {
    border-left: 4px solid #1878B4;
    margin: 12pt 0;
    padding: 8pt 16pt;
    background-color: #f0f7fc;
    color: #333;
}

a {
    color: #1878B4;
    text-decoration: none;
}

.cover-page {
    text-align: center;
    padding-top: 200pt;
}

.cover-page h1 {
    font-size: 32pt;
    border: none;
    color: #1878B4;
}

.cover-page p {
    font-size: 14pt;
    color: #666;
    margin-top: 24pt;
}
"""

def generate_pdf():
    """Generate the client handover PDF."""
    
    # Create temp HTML file
    html_parts = [f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>{CSS}</style>
</head>
<body>
<div class="cover-page">
    <h1>BROS Technology</h1>
    <p>Project Handover Document</p>
    <p>Electronics Marketplace Platform</p>
    <p style="margin-top: 48pt; font-size: 11pt;">Prepared by: Fira Tech Solutions</p>
    <p style="font-size: 11pt;">Date: August 2026</p>
</div>
<div style="page-break-after: always;"></div>
"""]
    
    for doc_file in CLIENT_DOCS:
        doc_path = DOCS_DIR / doc_file
        if doc_path.exists():
            # Convert markdown to HTML using Python markdown
            md_content = doc_path.read_text(encoding="utf-8")
            html_content = markdown.markdown(
                md_content,
                extensions=['tables', 'fenced_code', 'codehilite', 'toc']
            )
            html_parts.append(html_content)
    
    html_parts.append("</body></html>")
    
    # Write HTML
    html_content = "\n".join(html_parts)
    temp_html = OUTPUT_DIR / "temp_handover.html"
    temp_html.write_text(html_content, encoding="utf-8")
    
    # Generate PDF with weasyprint
    from weasyprint import HTML
    HTML(filename=str(temp_html)).write_pdf(str(OUTPUT_PDF))
    
    # Cleanup
    temp_html.unlink()
    
    print(f"PDF generated: {OUTPUT_PDF}")
    print(f"Size: {OUTPUT_PDF.stat().st_size / 1024:.1f} KB")

if __name__ == "__main__":
    generate_pdf()
