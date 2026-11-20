<?php
declare(strict_types=1);

// Minimal synthetic PDF with a consistent binary cross-reference table.
$version = ctype_digit($argv[1] ?? '') ? $argv[1] : '1';
$stream = "BT /F1 16 Tf 80 760 Td (Documento sintetico $version) Tj ET\n";
$objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    '<< /Length ' . strlen($stream) . " >>\nstream\n$stream" . 'endstream',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
];
$pdf = "%PDF-1.4\n";
$offsets = ['0000000000 65535 f '];
foreach ($objects as $index => $object) {
    $offsets[] = sprintf('%010d 00000 n ', strlen($pdf));
    $number = $index + 1;
    $pdf .= "$number 0 obj\n$object\nendobj\n";
}
$xref = strlen($pdf);
echo $pdf . "xref\n0 " . count($offsets) . "\n" . implode("\n", $offsets)
    . "\ntrailer\n<< /Size " . count($offsets) . " /Root 1 0 R >>\nstartxref\n$xref\n%%EOF\n";
