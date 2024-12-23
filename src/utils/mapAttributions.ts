const attributions = [
    {
        'attributeTo': 'Baato',
        'attributionFor': 'Map',
        'link': 'https://baato.io'
    },
    {
        'attributeTo': 'MapLibre GL',
        'attributionFor': 'SDK',
        'link': 'https://github.com/maplibre/maplibre-gl-js'
    },
    {
        'attributeTo': 'OpenStreetMap Contributors',
        'attributionFor': 'Data',
        'link': 'http://osm.org/copyright'
    },
]
const generateMapAttribution = () => {
    return attributions.map(
        attribution => `${attribution.attributionFor} &copy; <a href='${attribution.link}' target='_blank' rel='noopener noreferrer'> ${attribution.attributeTo}</a>`
    ).join(", ")
};

export { generateMapAttribution };
