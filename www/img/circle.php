<?php 
$r = (int)$_GET['r'];
$g = (int)$_GET['g'];
$b = (int)$_GET['b'];
$width = 12;
$height = $width;

// create a blank image
$image = imagecreatetruecolor($height, $width);

$col_background = imagecolorallocate($image, 0, 0, 0);

// fill the background color
$background = imagecolortransparent($image,  $col_background);

// choose a color for the ellipse
$col_ellipse = imagecolorallocate($image, $r, $g, $b);

// draw the ellipse
imagefilledellipse($image, $width/2.0, $height/2.0, $width/2.0, $height/2.0, $col_ellipse);

// output the picture
header("Content-type: image/png");
imagepng($image);
