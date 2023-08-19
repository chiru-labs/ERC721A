cmd_Release/keccak.node := ln -f "Release/obj.target/keccak.node" "Release/keccak.node" 2>/dev/null || (rm -rf "Release/keccak.node" && cp -af "Release/obj.target/keccak.node" "Release/keccak.node")
