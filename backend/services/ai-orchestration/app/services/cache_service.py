"""
Redis caching service
"""
import logging
import json
import hashlib
from typing import Optional, Any
import redis
from redis.exceptions import RedisError

from app.config.settings import settings

logger = logging.getLogger(__name__)

class CacheService:
    """Redis-based caching service"""
    
    def __init__(self):
        """Initialize Redis client"""
        try:
            self.client = redis.from_url(settings.redis_url)
            self.client.ping()
            logger.info("Redis connection established")
        except RedisError as e:
            logger.warning(f"Redis connection failed: {str(e)}")
            self.client = None
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        if not settings.enable_caching or not self.client:
            return None
        
        try:
            value = self.client.get(key)
            if value:
                logger.debug(f"Cache hit: {key}")
                return json.loads(value)
            logger.debug(f"Cache miss: {key}")
            return None
        except Exception as e:
            logger.warning(f"Cache get failed: {str(e)}")
            return None
    
    def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> bool:
        """Set value in cache with TTL"""
        if not settings.enable_caching or not self.client:
            return False
        
        try:
            self.client.setex(
                key,
                ttl_seconds,
                json.dumps(value)
            )
            logger.debug(f"Cache set: {key} (TTL: {ttl_seconds}s)")
            return True
        except Exception as e:
            logger.warning(f"Cache set failed: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        if not self.client:
            return False
        
        try:
            self.client.delete(key)
            logger.debug(f"Cache deleted: {key}")
            return True
        except Exception as e:
            logger.warning(f"Cache delete failed: {str(e)}")
            return False
    
    def clear(self) -> bool:
        """Clear all cache"""
        if not self.client:
            return False
        
        try:
            self.client.flushdb()
            logger.info("Cache cleared")
            return True
        except Exception as e:
            logger.warning(f"Cache clear failed: {str(e)}")
            return False
    
    def get_or_set(self, key: str, compute_fn, ttl_seconds: int = 3600) -> Any:
        """Get from cache or compute and set"""
        cached = self.get(key)
        if cached is not None:
            return cached
        
        value = compute_fn()
        self.set(key, value, ttl_seconds)
        return value

def get_code_hash(code: str) -> str:
    """Generate hash of code for cache key"""
    return hashlib.sha256(code.encode()).hexdigest()[:16]

# Global cache instance
cache = CacheService()
