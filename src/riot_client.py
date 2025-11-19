"""
Riot Games API Client for League of Legends data collection.

This module provides a client for interacting with the Riot Games API,
specifically for collecting match data, summoner information, and account details.
"""

import time
import requests
from typing import Dict, List, Optional, Any
import yaml
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RiotAPIClient:
    """
    Client for interacting with Riot Games API.
    
    Supports match-v5, account-v1, and summoner-v4 endpoints with rate limiting.
    """
    
    def __init__(self, config_path: str = "config/config.yaml"):
        """
        Initialize the Riot API client with configuration.
        
        Args:
            config_path: Path to the configuration YAML file
        """
        self.config = self._load_config(config_path)
        self.api_key = self.config['riot_api']['api_key']
        self.region = self.config['riot_api']['region']
        self.platform = self.config['riot_api']['platform']
        
        # Rate limiting
        self.rate_limit = self.config['riot_api']['rate_limit']
        self.last_request_time = 0
        self.request_count = 0
        self.request_window_start = time.time()
        
        # Base URLs for different API endpoints
        self.regional_url = f"https://{self.region}.api.riotgames.com"
        self.platform_url = f"https://{self.platform}.api.riotgames.com"
        
        self.headers = {
            "X-Riot-Token": self.api_key
        }
        
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from YAML file."""
        try:
            with open(config_path, 'r') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            raise FileNotFoundError(
                f"Configuration file not found: {config_path}. "
                "Please copy config_example.yaml to config.yaml and add your API key."
            )
    
    def _rate_limit_wait(self):
        """Implement rate limiting to avoid API throttling."""
        current_time = time.time()
        
        # Check if we need to reset the request window (2 minutes)
        if current_time - self.request_window_start >= 120:
            self.request_count = 0
            self.request_window_start = current_time
        
        # Check requests per two minutes limit
        if self.request_count >= self.rate_limit['requests_per_two_minutes']:
            wait_time = 120 - (current_time - self.request_window_start)
            if wait_time > 0:
                logger.info(f"Rate limit reached. Waiting {wait_time:.2f} seconds...")
                time.sleep(wait_time)
                self.request_count = 0
                self.request_window_start = time.time()
        
        # Check requests per second limit
        time_since_last_request = current_time - self.last_request_time
        min_interval = 1.0 / self.rate_limit['requests_per_second']
        
        if time_since_last_request < min_interval:
            time.sleep(min_interval - time_since_last_request)
        
        self.last_request_time = time.time()
        self.request_count += 1
    
    def _make_request(self, url: str) -> Optional[Dict]:
        """
        Make a request to the Riot API with rate limiting and error handling.
        
        Args:
            url: The full URL to request
            
        Returns:
            JSON response as dictionary, or None if request fails
        """
        self._rate_limit_wait()
        
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 404:
                logger.warning(f"Resource not found: {url}")
            elif response.status_code == 429:
                logger.warning("Rate limit exceeded. Waiting before retry...")
                time.sleep(120)
                return self._make_request(url)
            else:
                logger.error(f"HTTP error occurred: {e}")
            return None
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed: {e}")
            return None
    
    def get_account_by_riot_id(self, game_name: str, tag_line: str) -> Optional[Dict]:
        """
        Get account information by Riot ID (account-v1).
        
        Args:
            game_name: The game name (e.g., "Player")
            tag_line: The tag line (e.g., "NA1")
            
        Returns:
            Account information dictionary
        """
        url = f"{self.regional_url}/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        return self._make_request(url)
    
    def get_summoner_by_puuid(self, puuid: str) -> Optional[Dict]:
        """
        Get summoner information by PUUID (summoner-v4).
        
        Args:
            puuid: The player's PUUID
            
        Returns:
            Summoner information dictionary
        """
        url = f"{self.platform_url}/lol/summoner/v4/summoners/by-puuid/{puuid}"
        return self._make_request(url)
    
    def get_summoner_by_name(self, summoner_name: str) -> Optional[Dict]:
        """
        Get summoner information by summoner name (summoner-v4).
        
        Args:
            summoner_name: The summoner name
            
        Returns:
            Summoner information dictionary
        """
        url = f"{self.platform_url}/lol/summoner/v4/summoners/by-name/{summoner_name}"
        return self._make_request(url)
    
    def get_match_ids_by_puuid(
        self, 
        puuid: str, 
        start: int = 0, 
        count: int = 20,
        queue: Optional[int] = None,
        type_filter: Optional[str] = None
    ) -> Optional[List[str]]:
        """
        Get list of match IDs for a player (match-v5).
        
        Args:
            puuid: The player's PUUID
            start: Starting index (default 0)
            count: Number of matches to return (default 20, max 100)
            queue: Queue ID filter (e.g., 420 for Ranked Solo/Duo)
            type_filter: Match type filter (e.g., "ranked", "normal")
            
        Returns:
            List of match IDs
        """
        url = f"{self.regional_url}/lol/match/v5/matches/by-puuid/{puuid}/ids"
        params = {"start": start, "count": count}
        
        if queue:
            params["queue"] = queue
        if type_filter:
            params["type"] = type_filter
            
        # Add params to URL
        param_str = "&".join([f"{k}={v}" for k, v in params.items()])
        url = f"{url}?{param_str}"
        
        return self._make_request(url)
    
    def get_match_details(self, match_id: str) -> Optional[Dict]:
        """
        Get detailed match information (match-v5).
        
        Args:
            match_id: The match ID (format: REGION_matchId)
            
        Returns:
            Match details dictionary
        """
        url = f"{self.regional_url}/lol/match/v5/matches/{match_id}"
        return self._make_request(url)
    
    def get_match_timeline(self, match_id: str) -> Optional[Dict]:
        """
        Get match timeline information (match-v5).
        
        Args:
            match_id: The match ID (format: REGION_matchId)
            
        Returns:
            Match timeline dictionary
        """
        url = f"{self.regional_url}/lol/match/v5/matches/{match_id}/timeline"
        return self._make_request(url)


if __name__ == "__main__":
    # Example usage
    try:
        client = RiotAPIClient("config/config.yaml")
        logger.info("Riot API Client initialized successfully")
        logger.info(f"Region: {client.region}, Platform: {client.platform}")
    except FileNotFoundError as e:
        logger.error(e)
        logger.info("Please create config/config.yaml from config/config_example.yaml")
