import os
import requests
import json
from dotenv import load_dotenv

# Load API key from environment variables
load_dotenv()
API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")


if not API_KEY:
    raise EnvironmentError("GOOGLE_PLACES_API_KEY not found in environment variables")

# Base URLs for Google Places API
PLACES_API_BASE = "https://maps.googleapis.com/maps/api/place"
TEXT_SEARCH_URL = f"{PLACES_API_BASE}/textsearch/json"
PLACE_DETAILS_URL = f"{PLACES_API_BASE}/details/json"

def search_charities(query, location="UK"):
    """
    Search for charities based on a query and location.
    
    Args:
        query (str): The search term (e.g., "food bank charity")
        location (str): Location to search within (e.g., "London, UK")
        
    Returns:
        list: List of charity places found
    """
    # If location is already included in the query, don't add it again
    if location.lower() in query.lower():
        search_query = f"{query} charity"
    else:
        search_query = f"{query} charity {location}"
    
    params = {
        "query": search_query,
        "key": API_KEY,
        "type": "establishment",  # Focus on businesses/organizations
        "language": "en"
    }
    
    try:
        response = requests.get(TEXT_SEARCH_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        # Debug printing
        print(f"API Response Status: {data['status']}")
        if data.get('error_message'):
            print(f"Error message: {data.get('error_message')}")
        
        if data["status"] != "OK" and data["status"] != "ZERO_RESULTS":
            print(f"API Error: {data['status']}")
            return {"error": f"Google Maps API Error: {data['status']}"}
            
        results = []
        for place in data.get("results", []):
            # Extract relevant info
            results.append({
                "place_id": place.get("place_id"),
                "name": place.get("name"),
                "address": place.get("formatted_address"),
                "location": {
                    "lat": place.get("geometry", {}).get("location", {}).get("lat"),
                    "lng": place.get("geometry", {}).get("location", {}).get("lng")
                },
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
                "types": place.get("types", [])
            })
            
        return results
        
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return {"error": str(e)}

def get_place_details(place_id):
    """
    Get detailed information about a specific place using its place_id.
    
    Args:
        place_id (str): The Google Maps place_id
        
    Returns:
        dict: Detailed information about the place
    """
    params = {
        "place_id": place_id,
        "key": API_KEY,
        "fields": "name,formatted_address,formatted_phone_number,website,opening_hours,geometry,rating,url,types,photos"
    }
    
    try:
        response = requests.get(PLACE_DETAILS_URL, params=params)
        response.raise_for_status()
        data = response.json()
        
        if data["status"] != "OK":
            print(data)
            print(f"API Error: {data['status']}")
            return {"error": f"Google Maps API Error: {data['status']}"}
            
        result = data.get("result", {})
        
        # Format opening hours in a more usable way
        opening_hours = {}
        periods = result.get("opening_hours", {}).get("periods", [])
        weekday_text = result.get("opening_hours", {}).get("weekday_text", [])
        
        # Convert the Google periods to our format
        days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        for i, day in enumerate(days):
            # Default to closed
            opening_hours[day] = {"isOpen": False, "start": "09:00", "end": "17:00"}
            
            # Find the period for this day (if it exists)
            for period in periods:
                if period.get("open", {}).get("day") == i:
                    # This day has hours
                    open_time = period.get("open", {}).get("time", "0900")
                    close_time = period.get("close", {}).get("time", "1700")
                    
                    # Format times from "0900" to "09:00"
                    formatted_open = f"{open_time[:2]}:{open_time[2:]}"
                    formatted_close = f"{close_time[:2]}:{close_time[2:]}"
                    
                    opening_hours[day] = {
                        "isOpen": True,
                        "start": formatted_open,
                        "end": formatted_close
                    }
                    break
                    
        # Construct the final result object
        formatted_result = {
            "place_id": place_id,
            "name": result.get("name"),
            "address": result.get("formatted_address"),
            "phone_number": result.get("formatted_phone_number", ""),
            "website_link": result.get("website", ""),
            "location": {
                "lat": result.get("geometry", {}).get("location", {}).get("lat"),
                "lng": result.get("geometry", {}).get("location", {}).get("lng")
            },
            "opening_hours": opening_hours,
            "rating": result.get("rating"),
            "google_maps_url": result.get("url"),
            "types": result.get("types", []),
            "hours_text": weekday_text
        }
        
        return formatted_result
        
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return {"error": str(e)}