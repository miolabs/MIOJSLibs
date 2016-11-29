/**
 * Created by godshadow on 21/5/16.
 */

/// <reference path="MIOView.ts" />

class MIOActivityIndicator extends MIOView
{
    initWithLayer(layer, options?)
    {
        super.initWithLayer(layer, options);

        var svg = "";

        svg += '<svg width="30px" height="30px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="uil-default">';
        svg += '  <rect x="0" y="0" width="100" height="100" fill="none" class="bk"></rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(0 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(30 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.08333333333333333s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(60 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.16666666666666666s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(90 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.25s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(120 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.3333333333333333s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(150 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.4166666666666667s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(180 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.5s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(210 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.5833333333333334s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(240 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.6666666666666666s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(270 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.75s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(300 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.8333333333333334s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '  <rect x="46.5" y="40" width="7" height="20" rx="5" ry="5" fill="#ffffff" transform="rotate(330 50 50) translate(0 -30)">';
        svg += '     <animate attributeName="opacity" from="1" to="0" dur="1s" begin="0.9166666666666666s" repeatCount="indefinite"></animate>';
        svg += '  </rect>';
        svg += '</svg>';

        this.layer.innerHTML = svg;
    }
}