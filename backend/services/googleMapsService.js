const { Client } = require('@googlemaps/google-maps-services-js');

class GoogleMapsService {
  constructor() {
    this.client = new Client({});
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY;
  }

  /**
   * Geocode a place name to coordinates
   * @param {string} placeName - Name of the place
   * @returns {object} Location data with coordinates
   */
  async geocodePlace(placeName) {
    try {
      const response = await this.client.geocode({
        params: {
          address: placeName,
          key: this.apiKey
        }
      });

      if (response.data.results.length > 0) {
        const result = response.data.results[0];

        return {
          coordinates: [
            result.geometry.location.lng,
            result.geometry.location.lat
          ],
          address: result.formatted_address,
          placeName: placeName,
          placeType: result.types[0] || 'unknown'
        };
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error('Failed to geocode location');
    }
  }

  /**
   * Find places by type near a location
   * @param {string} placeType - Type of place (e.g., 'grocery_store')
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in meters
   * @returns {array} List of places
   */
  async findNearbyPlaces(placeType, lat, lng, radius = 5000) {
    try {
      const response = await this.client.placesNearby({
        params: {
          location: { lat, lng },
          radius,
          type: placeType,
          key: this.apiKey
        }
      });

      return response.data.results.map(place => ({
        name: place.name,
        address: place.vicinity,
        coordinates: [
          place.geometry.location.lng,
          place.geometry.location.lat
        ],
        placeId: place.place_id,
        types: place.types
      }));
    } catch (error) {
      console.error('Places search error:', error);
      throw new Error('Failed to search nearby places');
    }
  }

  /**
   * Search for places by text query
   * @param {string} query - Search query
   * @returns {array} List of places
   */
  async searchPlaces(query) {
    try {
      const response = await this.client.findPlaceFromText({
        params: {
          input: query,
          inputtype: 'textquery',
          fields: ['formatted_address', 'geometry', 'name', 'place_id', 'types'],
          key: this.apiKey
        }
      });

      if (response.data.candidates.length > 0) {
        return response.data.candidates.map(place => ({
          name: place.name,
          address: place.formatted_address,
          coordinates: [
            place.geometry.location.lng,
            place.geometry.location.lat
          ],
          placeId: place.place_id,
          types: place.types
        }));
      }

      return [];
    } catch (error) {
      console.error('Place search error:', error);
      throw new Error('Failed to search places');
    }
  }

  /**
   * Calculate distance between two points
   * @param {number} lat1 - First point latitude
   * @param {number} lng1 - First point longitude
   * @param {number} lat2 - Second point latitude
   * @param {number} lng2 - Second point longitude
   * @returns {number} Distance in meters
   */
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Check if a point is within a radius of a location
   * @param {number} userLat - User latitude
   * @param {number} userLng - User longitude
   * @param {number} targetLat - Target latitude
   * @param {number} targetLng - Target longitude
   * @param {number} radius - Radius in meters
   * @returns {boolean} Whether the point is within radius
   */
  isWithinRadius(userLat, userLng, targetLat, targetLng, radius) {
    const distance = this.calculateDistance(userLat, userLng, targetLat, targetLng);
    return distance <= radius;
  }
}

module.exports = new GoogleMapsService();
