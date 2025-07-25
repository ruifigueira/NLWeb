# Copyright (c) 2025 Microsoft Corporation.
# Licensed under the MIT License

"""
Inception API wrapper for LLM functionality.

WARNING: This code is under development and may undergo changes in future releases.
Backwards compatibility is not guaranteed at this time.
"""

import os
import requests
import json
import re
import aiohttp
import ssl
import asyncio
import threading
from typing import Dict, Any, Optional

from llm_providers.llm_provider import LLMProvider


class ConfigurationError(RuntimeError):
    """Raised when configuration is missing or invalid."""
    pass



class InceptionProvider(LLMProvider):
    """Implementation of LLMProvider for Inception API.

        Perform a single-shot (non-streaming) chat completion asynchronously.
    Returns the full assistant response as a string, or as structured JSON if schema is provided.
"""
    
    API_URL = "https://api.inceptionlabs.ai/v1/chat/completions"  # Mercury chat endpoint

    @classmethod
    def get_api_key(cls) -> str:
        """Get API key from environment variables."""
        key = os.getenv("INCEPTION_API_KEY")
        if not key:
            raise ConfigurationError("INCEPTION_API_KEY environment variable is not set")
        return key

    @classmethod
    def get_client(cls):
        """
        Inception uses direct HTTP calls, so there's no persistent client.
        This method is implemented to satisfy the interface but returns None.
        """
        return None

    @classmethod
    def clean_response(cls, content: str) -> Dict[str, Any]:
        """
        Strip markdown fences and extract the first JSON object.
        """
        cleaned = re.sub(r"```(?:json)?\s*", "", content).strip()
        match = re.search(r"(\{.*\})", cleaned, re.S)
        if not match:
            return {}
        return json.loads(match.group(1))

    async def get_completion(
        self,
        prompt: str,
        schema: Optional[Dict[str, Any]] = None,
        model: str = "mercury-small",
        temperature: float = 0,
        max_tokens: int = 512,
        timeout: float = 30.0,
        diffusing: bool = False,
        **kwargs
    ) -> Any:
        """
        Perform a single-shot (non-streaming) chat completion asynchronously.
        Returns the full assistant response as a string, or as structured JSON if schema is provided.
        

        Args:
            prompt: The user prompt to send to the model
            schema: Optional JSON schema that the response should conform to
            model: The model to use for completion
            temperature: Controls randomness (0-1)
            max_tokens: Maximum number of tokens to generate
            timeout: Request timeout in seconds
            diffusing: Whether to use diffusion mode
            **kwargs: Additional provider-specific arguments
            
        Returns:
            String response or parsed JSON object if schema is provided
        """
        HEADERS = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.get_api_key()}",
        }   
        messages = []
        
        if schema:
            # Add system message to enforce JSON schema
            system_prompt = f"Provide a response that matches this JSON schema: {json.dumps(schema)}"
            messages.append({"role": "system", "content": system_prompt})
        
        # Add user message
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if diffusing:
            payload["diffusing"] = True

        try:
            # Create SSL context that's more lenient with certificate verification
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            
            connector = aiohttp.TCPConnector(ssl=ssl_context)
            client_timeout = aiohttp.ClientTimeout(total=timeout)
            
            async with aiohttp.ClientSession(connector=connector, timeout=client_timeout) as session:
                async with session.post(
                    self.API_URL, 
                    headers=HEADERS, 
                    json=payload
                ) as resp:
                    resp.raise_for_status()
                    data = await resp.json()
                    content = data["choices"][0]["message"]["content"]
                    
                    # If schema was provided, parse the response as JSON
                    if schema:
                        return self.clean_response(content)
                    return content
        except Exception as e:
            # Log the error and return empty response
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Inception API error: {e}")
            return {} if schema else ""


# Create a singleton instance
provider = InceptionProvider()

