---
layout: default
title: Porting Tiny BVH to WASM with Emscripten
date: 2024-11-15
description: "Deep dive into porting a high-performance BVH library to WebAssembly using Emscripten, covering SIMD optimization, threading challenges, and debugging techniques for browser-based ray tracing."
tags: ["WASM", "C++", "Performance", "Ray Tracing"]
---

# Porting Tiny BVH to WASM with Emscripten

Given my recent extra free time, I’ve decided to learn WASM and how it can be used with C/C++. To this end, I’ve decided to help port a high-performance library to it.

## Basics

-   **Why?** Because it’s fun to do 😄, and because I wanted to test WASM generation.
-   **What’s Tiny BVH?** It’s Single-header BVH (Bounding Volume Hierarchy, used in ray tracing) construction and traversal library by Jacco Bikkers. More info [here](https://github.com/jbikker/tinybvh).
-   **What’s WASM?** Web Assembly is a binary bytecode virtual machine implemented in most browsers. It’s faster to interpret than Javascript as it was designed with performance in mind. More info [here](https://webassembly.org/).
-   **What’s Emscripten?** It’s a C/C++ toolchain that uses Clang and LLVM to generate WASM libraries. It also emulates a kind of [POSIX OS](https://en.wikipedia.org/wiki/POSIX#:~:text=The%20Portable%20Operating%20System%20Interface,maintaining%20compatibility%20between%20operating%20systems.), comes with a ported LibC based on [Musl LibC](https://github.com/emscripten-core/musl) (musl reminds me of [Müsli](https://www.google.com/search?sca_esv=33eeff773bbaf247&rlz=1C1CHBF_enDE1135DE1135&sxsrf=ADLYWIIVwSHhlKwoOB9Gv1XV2aOJ4aVtfQ:1731714057110&q=musli&udm=2&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_TJ4YMS4eRay1mUcjRHkZx44LzMys48lpBMHIZMkq1-CwxpH0BbJDd6xqHSYmJINoS8X3Be5tAnY_NJf82XrCcSPIstJZ_zdT8vIMdlIC7qNDXWnIxECFtqliVWpAIRQRjQDJ1AsOA-gHHAvFBPaEbrSp2V&sa=X&ved=2ahUKEwii2OfJwd-JAxUEB9sEHd_SDacQtKgLegQIExAB&biw=1920&bih=911&dpr=1)), and comes with some ported libraries like SDL or OpenGL (using WebGL). More info [here](https://emscripten.org/docs/introducing_emscripten/about_emscripten.html) and [here to download](https://emscripten.org/docs/getting_started/downloads.html).
-   **What’s this post?** A collection of the things I did and learned while porting the library.

## Compiling

The basic compilation was quite easy to get going. Once you get your EMSDK environment in your terminal, you only need a few commands to use it.

```bash
emsdk install latest
emsdk.bat activate latest
emcmake cmake -S {YOUR_PROJECT} -B {YOUR_PROJECT}/build/web -G "Ninja Multi-Config"
cmake --build {YOUR_PROJECT}/build/web/ --config Release
```

In terms of compiler flags, it was quite easy. I only had to remove the use of `-march=native` for the Emscripten target (as the native arch doesn’t make sense for a WASM target). The other change was to include the flag to allow memory growth, `-sALLOW_MEMORY_GROWTH=1`, as by default Emscripten allocates a fixed amount of memory for you (also to note, WASM was [until recently](https://webassembly.org/features/#linear-memory-bigger-than-4-gib) only allowed to [address 4GB of memory](https://github.com/WebAssembly/memory64/blob/main/proposals/memory64/Overview.md)). Also to note, you share your allocator with the rest of the website, so be prudent in your allocations as always (you can create allocator contention or blow up the heap for the rest of the website). You can see these changes [here](https://github.com/jbikker/tinybvh/pull/18/commits/9490947cd099c32856170777e2f1e13c706507bb).

As for code changes, they were only minimal. The library uses `aligned_alloc` aligned to 64 bytes (usual cache line, and to avoid having accesses going through two of them) for better performance. It’s important to note, as I had to solve some mysterious nullptr crashes, as the Emscripten’s LibC follows the standard to the [letter](https://en.cppreference.com/w/c/memory/aligned_alloc), so you have to make the requested size a multiple of the alignment (if not a multiple this is UB, and other platforms just fix it for you or don’t care about it) or the allocation will fail with a nullptr return. You can see the code [here](https://github.com/jbikker/tinybvh/pull/18/commits/d8bb9c61afd1e6214ce3b59bcfb72e04559fb87e).

Finally for code changes, I recommend detecting the Emscripten compilation by checking the definition of the `__EMSCRIPTEN__` macro before checking for Clang or GCC. This is because Emscripten uses Clang for the C/C++ compiler, which means most of the macros are defined, and because Clang defines some GCC flags for compatibility.  
Finally, for testing we have to set `CMAKE_EXECUTABLE_SUFFIX` to `.html`. This is because Emscripten by default outputs a library for you to hook to your website. Setting the output suffix to HTML tells the linker to generate a basic test website that loads your library. You can see this commit [here](https://github.com/jbikker/tinybvh/pull/18/commits/9490947cd099c32856170777e2f1e13c706507bb).

![Example website generated by Emscripten](https://oliveroschristian.wordpress.com/wp-content/uploads/2024/11/image.png)

## File Loading

The speed test used by Tiny BVH uses the classic [Sponza](https://github.com/jimmiebergmann/Sponza) model for testing. Emscripten provides a Virtual File system to hide some of the complexity of being a VM running on a browser (e. g. how are those files persisted or where do they come from). As the test is quite simple, we can just use the default which is to use an in-memory only file system (nothing is persisted). More info [here](https://emscripten.org/docs/api_reference/Filesystem-API.html#filesystem-api).

To package and distribute the file, we can also use Emscripten default capabilities showed [here](https://emscripten.org/docs/porting/files/packaging_files.html#modifying-file-locations-in-the-virtual-file-system). We can use the linker flag `--preload-file "${CMAKE_CURRENT_LIST_DIR}/testdata@/testdata"` to take the test data folder, package all the contents inside of it, and then make it available at the root of the virtual file system. Note that this might not be the best way to package and distribute files, as everything is put inside the generated WASM/Javascript, but it works for this simple use case.

## Debugging

As with normal Clang, you can generate by using the `-g` flag. For Emscripten that flag generates [DWARF](https://en.wikipedia.org/wiki/DWARF) debug symbols that are embedded inside the library (note that this increases the size of your library). It’s important to note that if you have debug symbols enabled, Emscripten will disable some optimizations in the WASM and Javascript generation (so your profiling might be skewed if you have symbols enabled). More info [here](https://emscripten.org/docs/porting/Debugging.html#debugging-in-the-browser).

Note that if you are using Chrome, I highly suggest following [Google’s tutorial](https://developer.chrome.com/blog/wasm-debugging-2020/) to get DWARF debug symbols working. For that you need to download the [DWARF extension](https://chromewebstore.google.com/detail/cc++-devtools-support-dwa/pdcpmagijalfljmkmjngeonclgbbannb?pli=1) for Chrome. As well, to help finding the symbols I suggest using the linker flag `-fdebug-compilation-dir='<YOUR_PROJECT_FOLDER>'`. In case the symbols are not loaded properly, in Chrome you can add folders by going to the *Sources* tab in the *Developer Tools*, then to the *Workspaces* window, and finally click *Add Folder* (note that Chrome will create a popup asking for permission to load the selected folder).

You can also enable ASAN (Address SANitizer), and other [sanitizers](https://emscripten.org/docs/debugging/Sanitizers.html#debugging-with-sanitizers). For ASAN you only need to supply the `-fsanitize=address` flag to the compiler and linker. I have to note though, that if you breakpoint on exceptions you will not stop at the ASAN exception but rather at the Javascript report function (you can still use ASAN’s printed callstack to help you find the issue).

## Testing

To test you can use any HTTP server you like. I prefer to use [Python’s default one](https://docs.python.org/3/library/http.server.html) as it’s easy to use and setup. I have to note that this is not the kind of server you should use in production, but for testing purposes is alright.

You can run it by doing:

```bash
python3 -m http.server -d <YOUR_BUILD_FOLDER>
```

This starts a basic HTTP server hosted in `localhost:8000`, that serves `YOUR_BUILD_FOLDER`. You can access it in Chrome by accessing the `localhost:8000` website.

And with that, we can load the basic version of the test 😄

![Eureka, we can see something. Note that this version is not using SIMD or threads at all, but it’s running in a browser with minimal changes (the tests running at 0.0ms are not enabled as they require SIMD instructions). We’ll get to improve it later on.](https://oliveroschristian.wordpress.com/wp-content/uploads/2024/11/image-2.png)

## SIMD

Now that we have the basics covered, we can start enabling the good stuff. First, we should check Emscripten’s capabilities. From their [documentation](https://emscripten.org/docs/porting/simd.html), we can see that there are two options: fixed-width SIMD and relaxed SIMD. The former is the standard SIMD while trying to smooth out differences between different native SIMD architectures (in terms of precision or side effects), while the latter allows differences in execution between different native SIMD architectures (more info [here](https://github.com/WebAssembly/relaxed-simd/blob/main/proposals/relaxed-simd/Overview.md) and [here](https://docs.google.com/presentation/d/1Qnx0nbNTRYhMONLuKyygEduCXNOv3xtWODfXfYokx1Y/edit#slide=id.gc6ea82adec_0_76)). Fixed-width SIMD is enabled by using the `-msimd128` compiler flag, and relaxed SIMD is enabled by using the `-mrelaxed-simd` compiler flag. I’ll focus on the fixed-width SIMD, as it’s [supported by all browsers](https://webassembly.org/features/).

Now, most of Tiny BVH uses AVX (Intel) intrinsics. You could include the `wasm_simd128.h` header to replace all of them with WASM intrinsic (this might yield better performance but increase support work), or you could enable the AVX intrinsics by using the `-mavx` flag. These flags on Emscripten enable ports of Intel’s `*mmintrin.h` headers (the SSE flags and ARM NEON intrinsics are also available). It’s important to note that not everything is mapped to a single native intrinsic instruction, as some are mapped to several and some are even lowered to scalar algorithms (e.g. AVX instructions are emulated with m128 registers). To get warnings if you are using slow ported intrinsics, define `WASM_SIMD_COMPAT_SLOW` before your code to get warnings. [Here](https://emscripten.org/docs/porting/simd.html) for more info and here for the [xmmintrin.h](https://github.com/emscripten-core/emscripten/blob/main/system/include/compat/xmmintrin.h) port.

Now, to test in C++ if SIMD instructions are enabled, you can check if `__wasm_simd128__` or `__wasm_relaxed_simd__` are defined, and then use the headers and intrinsics you need.

![And voilà, now almost everything works! We are only missing threading, which will come next.](https://oliveroschristian.wordpress.com/wp-content/uploads/2024/11/image-3.png)

## Threading

Now to the fun part. Threads were a problem for browsers for a while due to security concerns ([due to side-channel attacks](https://meltdownattack.com/)). In 2020, these concerns were solved and threads were re-enabled, as long as you configured your page in a specific way. For that, you need to enable COOP and COEP on your website. These options, from my understanding, separate your website from others and make your page run as its own process (basically more isolation to avoid side-channel problems). You can read more [here](https://web.dev/articles/coop-coep), but you need to set the next HTTP headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

If you have been using Python’s basic HTTP server you might notice that it doesn’t allow you to set HTTP headers by default. I’ve uploaded a small Python script that adds the missing headers to the basic HTTP server. You can find it [here](https://github.com/maniatic0/emcc-test-server), and it’s based on [this comment](https://stackoverflow.com/a/13354482) if you want to implement it yourself.

With that out of our way, we can start enabling threading. Emscripten supports two APIs, the common [Pthreads](https://en.wikipedia.org/wiki/Pthreads#:~:text=In%20computing%2C%20POSIX%20Threads%2C%20commonly,work%20that%20overlap%20in%20time.) API (that follows the POSIX standard) and [WASM Threads](https://emscripten.org/docs/api_reference/wasm_workers.html) (closer to the actual underlying browser thread API). Now, the C++ standard and a lot of libraries can use Pthreads for their threads, so I’ll focus on them, but if you have specific performance needs you might want to use the WASM Threads API (at the cost of more support).

Before we enable threads, there is another important caveat. Normally the way your library’s main (entry point) is executed is through the DOM Rendering thread in the browser. This is the common way Javascript is executed, everything in a single thread. As you guess, that means if your main takes a while you’ll block your website and get non-responsive alerts (like if you don’t answer your OS events). But also it comes with other caveats, for example some functionality like [WebGL](https://emscripten.org/docs/porting/pthreads.html#proxying) can only run on the DOM thread or [synchronization primitives that cannot lock](https://emscripten.org/docs/porting/pthreads.html#blocking-on-the-main-browser-thread). Emscripten helps with some of this by providing proxy functions that send your calls to the DOM thread or synchronization primitives that spin lock or warn of their use in the DOM thread.

To get Pthreads enabled, you only need to pass the `-pthread` compiler and linker flag. That’s it, now you have threads 😄. Now, your Pthreads are actually using a thread pool in the browser. This might introduce delays if you plan to trigger several of them, so it’s better to create the browser’s pool earlier. This can be done with the –`sPTHREAD_POOL_SIZE=<JS Expression>` linker flag. As it uses a Javascript expression, you can ask the browser for the local recommended number of threads (*related* to the number of logical cores) with `-sPTHREAD_POOL_SIZE=navigator.hardwareConcurrency`. Finally, as I discovered while testing other flags, I recommend setting the `-sUSE_PTHREADS=1` linker flag to enable extra threading functionality. One example of a flag that requires it is the `-sPROXY_TO_PTHREAD=1` linker flag, which makes your main actually spawn a thread and run its content there (useful for benchmarks but maybe not that useful for a game engine).

With threads enabled, we reach the hardest part of the port. Tiny BVH uses [OpenMP](https://en.wikipedia.org/wiki/OpenMP) for the benchmarks to get a simple parallel execution backend. Recently, as of November 2024, OpenMP’s LLVM/clang implementation was ported to WASM in August 2024 (see [here](https://reviews.llvm.org/D142593?id=492403), [this](https://github.com/llvm/llvm-project/pull/71297), [here](https://github.com/llvm/llvm-project/pull/95169), and [this](https://github.com/abrown/wasm-openmp-examples/blob/main/emscripten.sh)). Normally, you would set the `-fopenmp` compiler and linker flag to enable this in clang, which would link a precompiled version of the lib and include its headers.

Sadly, for Emscripten these precompiled libs and auto-includes are not enabled. So you need to compile OpenMP yourself. After some trial and error, I got [this](https://github.com/maniatic0/wasm-win-openmp-fix/blob/main/build.bat) build script working on Windows (based on [this](https://github.com/abrown/wasm-openmp-examples/blob/main/emscripten.sh)). It took me a day to get it working as there were some issues while building it due to how recent this addition is to LLVM’s OpenMP. I contributed to their repo with fixes that you can see in [Issue](https://github.com/llvm/llvm-project/issues/116552), [PR 1](https://github.com/llvm/llvm-project/pull/116874), and [PR 2](https://github.com/llvm/llvm-project/pull/117038) in their GitHub repo. If you find more issues, I suggest you contribute to them as they gave their work for free so we could use their library in WASM. Finally, to get everything working and because everything is super new, I suggest getting the [Tip-Of-Tree (tot)](https://emscripten.org/docs/contributing/developers_guide.html#setting-up) version of the EMSDK that includes the latest SDK and Tools by using:

```bash
emsdk install tot
emsdk activate tot
```

To get this working with your library you only need to include `-I<OpenMP>\build\include -fopenmp=libomp` in your compiler flags and `<OpenMP>\build\lib\libomp.a -fopenmp=libomp` for your linker.

For Tiny BVH, this is library is not enabled by default in their CMake. This is because including precompiled binaries is iffy, and because pulling and building part of the LLVM project. So, before you configure the project you can set the `CXXFLAGS` environment variable with `-I<OpenMP>\build\include <OpenMP>\build\lib\libomp.a -fopenmp=libomp` to force include them while compiling and linking (note this is not the best way, but it allows to inject it without changing the CMake file).

![OpenMP, Proxy Main, and Fixed SIMD enabled](https://oliveroschristian.wordpress.com/wp-content/uploads/2024/11/image-5.png)

![OpenMP, Proxy Main, and Relaxed SIMD enabled](https://oliveroschristian.wordpress.com/wp-content/uploads/2024/11/image-6.png)

Which is quite cool, close to real-time. We can also compare it to the native version.

![Window’s native version](https://oliveroschristian.wordpress.com/wp-content/uploads/2024/11/image-7.png)

Which, for the `CPU, coherent, 2-way, packets/SSE, MT` test (the fastest on both versions) has a 20.68% difference in favor of the native one. It’s also interesting to see that building the BVH takes quite a lot more (up to triple) time than the native versions (my guess is that an SSE builder might perform better due to the way SIMD works in WASM).

## Next Steps

I would like to experiment with a small WebGL renderer to see the rays’ output (only something based on depth), and also experiment with WebGPU’s compute shaders for real-time GPU ray tracing 😄(as WebGPU [continues to stabilize in browsers](https://caniuse.com/webgpu)).
