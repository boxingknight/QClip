#!/bin/bash
echo "Search for logs with:"
echo "1. In Console.app, click the search box"
echo "2. Type: ClipForge"
echo "3. Filter by: 'ClipForge' (the app name, not 'ClipForge.app')"
echo ""
echo "OR in Terminal:"
echo "log show --predicate 'process == \"ClipForge\"' --last 5m --info"
