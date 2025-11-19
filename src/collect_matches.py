"""
Match data collection script for League of Legends.

This script collects match data from the Riot Games API using a snowball sampling
approach, starting from a seed summoner and expanding to other players.
"""

import json
import os
import time
import argparse
from pathlib import Path
from typing import Set, List, Dict
import logging
from riot_client import RiotAPIClient

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class MatchCollector:
    """
    Collects League of Legends match data using snowball sampling.
    
    Starts with a seed summoner and expands to collect matches from other
    players encountered in those matches.
    """
    
    def __init__(self, config_path: str = "config/config.yaml"):
        """
        Initialize the match collector.
        
        Args:
            config_path: Path to the configuration file
        """
        self.client = RiotAPIClient(config_path)
        self.config = self.client.config
        
        # Data collection settings
        self.max_matches = self.config['data_collection']['max_matches']
        self.output_dir = Path(self.config['data_collection']['output_dir'])
        self.queue_type = self.config['data_collection'].get('queue_type')
        
        # Create output directory
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Tracking sets
        self.collected_matches: Set[str] = set()
        self.seen_puuids: Set[str] = set()
        self.puuid_queue: List[str] = []
        
        # Load existing data if resuming
        self._load_existing_data()
    
    def _load_existing_data(self):
        """Load previously collected match IDs to avoid duplicates."""
        match_files = list(self.output_dir.glob("match_*.json"))
        for match_file in match_files:
            match_id = match_file.stem.replace("match_", "")
            self.collected_matches.add(match_id)
        
        if self.collected_matches:
            logger.info(f"Found {len(self.collected_matches)} existing matches")
    
    def _save_match(self, match_id: str, match_data: Dict):
        """Save match data to JSON file."""
        output_file = self.output_dir / f"match_{match_id.replace('/', '_')}.json"
        with open(output_file, 'w') as f:
            json.dump(match_data, f, indent=2)
        logger.debug(f"Saved match {match_id}")
    
    def _get_queue_id(self) -> int:
        """Convert queue type string to queue ID."""
        queue_mapping = {
            "RANKED_SOLO_5x5": 420,
            "RANKED_FLEX_SR": 440,
            "NORMAL_DRAFT": 400,
            "NORMAL_BLIND": 430,
            "ARAM": 450,
        }
        return queue_mapping.get(self.queue_type, 420)
    
    def collect_from_summoner(self, summoner_name: str) -> bool:
        """
        Start collecting matches from a summoner.
        
        Args:
            summoner_name: The summoner's name
            
        Returns:
            True if successful, False otherwise
        """
        logger.info(f"Looking up summoner: {summoner_name}")
        
        # Get summoner info
        summoner = self.client.get_summoner_by_name(summoner_name)
        if not summoner:
            logger.error(f"Could not find summoner: {summoner_name}")
            return False
        
        puuid = summoner['puuid']
        logger.info(f"Found summoner with PUUID: {puuid}")
        
        # Add to queue
        self.puuid_queue.append(puuid)
        self.seen_puuids.add(puuid)
        
        return True
    
    def collect_from_puuid(self, puuid: str):
        """
        Collect matches for a specific PUUID.
        
        Args:
            puuid: The player's PUUID
        """
        logger.info(f"Collecting matches for PUUID: {puuid[:8]}...")
        
        # Get match IDs
        queue_id = self._get_queue_id() if self.queue_type else None
        match_ids = self.client.get_match_ids_by_puuid(
            puuid, 
            count=20, 
            queue=queue_id
        )
        
        if not match_ids:
            logger.warning(f"No matches found for PUUID: {puuid[:8]}...")
            return
        
        logger.info(f"Found {len(match_ids)} matches")
        
        # Collect each match
        for match_id in match_ids:
            if match_id in self.collected_matches:
                logger.debug(f"Match {match_id} already collected")
                continue
            
            if len(self.collected_matches) >= self.max_matches:
                logger.info(f"Reached maximum match limit: {self.max_matches}")
                return
            
            # Get match details
            match_data = self.client.get_match_details(match_id)
            if not match_data:
                logger.warning(f"Could not retrieve match: {match_id}")
                continue
            
            # Save match
            self._save_match(match_id, match_data)
            self.collected_matches.add(match_id)
            
            # Extract PUUIDs from participants
            if 'metadata' in match_data and 'participants' in match_data['metadata']:
                for participant_puuid in match_data['metadata']['participants']:
                    if participant_puuid not in self.seen_puuids:
                        self.puuid_queue.append(participant_puuid)
                        self.seen_puuids.add(participant_puuid)
            
            logger.info(
                f"Collected match {match_id} "
                f"({len(self.collected_matches)}/{self.max_matches})"
            )
    
    def run(self):
        """Run the match collection process."""
        logger.info("Starting match collection")
        logger.info(f"Target: {self.max_matches} matches")
        logger.info(f"Queue type: {self.queue_type}")
        logger.info(f"Output directory: {self.output_dir}")
        
        while self.puuid_queue and len(self.collected_matches) < self.max_matches:
            puuid = self.puuid_queue.pop(0)
            self.collect_from_puuid(puuid)
            
            # Progress update
            logger.info(
                f"Progress: {len(self.collected_matches)}/{self.max_matches} matches, "
                f"{len(self.puuid_queue)} PUUIDs in queue"
            )
        
        logger.info(f"Collection complete! Collected {len(self.collected_matches)} matches")
        logger.info(f"Data saved to: {self.output_dir}")


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description="Collect League of Legends match data from Riot API"
    )
    parser.add_argument(
        "--summoner",
        type=str,
        help="Starting summoner name (overrides config)"
    )
    parser.add_argument(
        "--max-matches",
        type=int,
        help="Maximum number of matches to collect (overrides config)"
    )
    parser.add_argument(
        "--config",
        type=str,
        default="config/config.yaml",
        help="Path to configuration file"
    )
    
    args = parser.parse_args()
    
    # Initialize collector
    try:
        collector = MatchCollector(args.config)
    except FileNotFoundError as e:
        logger.error(e)
        return 1
    
    # Override config with command line arguments
    if args.max_matches:
        collector.max_matches = args.max_matches
    
    # Get starting summoner
    summoner_name = args.summoner or collector.config['data_collection'].get('start_summoner')
    
    if not summoner_name:
        logger.error(
            "No starting summoner specified. "
            "Use --summoner flag or set start_summoner in config."
        )
        return 1
    
    # Start collection
    if collector.collect_from_summoner(summoner_name):
        collector.run()
        return 0
    else:
        return 1


if __name__ == "__main__":
    exit(main())
