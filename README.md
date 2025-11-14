# Top-K Artists in Archive

A high-performance solution for finding the most frequently appearing artists in large collections of compressed JSONL music log files. This project demonstrates efficient parallel processing, streaming algorithms, and data structure optimization techniques to solve the classic **Top-K problem** at scale.

## Overview

This project processes multiple gzip-compressed JSONL files in parallel, counting artist appearances across millions of records while maintaining memory efficiency. It uses a **min-heap with capacity constraint** to efficiently track the top K artists without storing all data in memory, making it suitable for processing datasets that exceed available RAM.

## Main Goals

1. **Efficient Top-K Retrieval**: Find the K most frequently appearing artists from large datasets using optimal data structures
2. **Memory-Efficient Processing**: Stream compressed files line-by-line to avoid loading entire datasets into memory
3. **Parallel Processing**: Leverage Node.js worker threads to process multiple files concurrently
4. **Scalability**: Support datasets ranging from small test cases (20-100 records) to production-scale (1-2 million records per file)
5. **Developer Experience**: Provide interactive difficulty selection and fast development iteration with TypeScript

## Theoretical Computer Science Topics

### 1. **Top-K Problem**
   - Finding the K most frequent items in a dataset
   - Time complexity: O(n log k) where n is the number of records and k is the desired top items
   - Space complexity: O(k) for maintaining the heap

### 2. **Heap Data Structure**
   - **Min-Heap with Capacity Constraint**: Maintains only the top K items by keeping the minimum at the root
   - **Heap Operations**: Insert, update, and sift operations (siftUp, siftDown)
   - **Index Mapping**: O(1) lookup for existing entries using a Map for efficient updates

### 3. **Streaming Algorithms**
   - Process data incrementally without loading entire files into memory
   - Chunked processing with async generators for backpressure management
   - Memory complexity independent of input size

### 4. **Parallel Processing & Concurrency**
   - Worker thread architecture for CPU-bound tasks
   - Result aggregation from multiple parallel workers
   - Thread-safe message passing between main thread and workers

### 5. **Algorithm Optimization**
   - Incremental aggregation: merge counts from multiple files efficiently
   - Early termination strategies through heap capacity limits
   - Batch processing with configurable chunk sizes (100,000 lines per chunk)

## Technological Techniques

### Core Technologies
- **Node.js Worker Threads**: Parallel file processing across multiple CPU cores
- **TypeScript**: Type-safe implementation with interfaces and type definitions
- **Streaming I/O**: `readline` and `zlib` for memory-efficient file processing
- **Async Generators**: Chunked data processing with backpressure control

### Architecture Patterns
- **Service Layer**: Separation of concerns with dedicated service modules
- **Model Layer**: Reusable data structures (MinHeap) with generic type support
- **Worker Pattern**: Isolated worker threads for parallel computation
- **Tool Layer**: Utility scripts for data generation and configuration

### Performance Optimizations
- **Gzip Streaming**: Decompress files on-the-fly without intermediate storage
- **Chunked Aggregation**: Process and yield results in batches to reduce memory spikes
- **Heap-based Top-K**: O(k) space complexity instead of O(n) for full sorting
- **Parallel File Processing**: Process multiple files simultaneously using worker threads

## Project Structure

```
src/
├── main.ts                          # Entry point, orchestrates execution
├── lib/
│   ├── const.ts                     # Constants (artists, difficulty levels, config)
│   ├── types.ts                     # TypeScript type definitions
│   └── interfaces.ts                # Interface definitions
├── services/
│   ├── index.ts                     # Main service orchestrating workers
│   └── count-artist-appearances-in-file.ts  # Streaming file processor
├── model/
│   └── min-heap.ts                  # Min-heap implementation with capacity
├── workers/
│   ├── worker.ts                    # Worker thread entry point
│   └── worker-dev.mjs               # Development worker loader (tsx support)
└── tools/
    ├── generate-data.ts             # Dataset generator
    └── select-difficulty.ts         # Interactive difficulty selector
```

## Getting Started

### Prerequisites
- Node.js 20+ (Node.js 25 used while developing)
- `pnpm` 10.20.0 (matching the `packageManager` field)

### Installation
```bash
pnpm install
```

### Generate Sample Data
Create compressed JSONL datasets under the `data/` directory:
```bash
pnpm generate-data
```

The generator creates three difficulty levels:
- **Easy**: 20-100 records per file (3 files) - for quick testing
- **Medium**: 50,000-100,000 records per file (3 files) - for moderate testing
- **Hard**: 1,000,000-2,000,000 records per file (3 files) - for performance benchmarking

### Run the Analyzer

**Development Mode** (transpiled on the fly, uses `hard` dataset):
```bash
pnpm dev
```

**Watch Mode** (auto-restart on changes):
```bash
pnpm watch
```

**Production Build**:
```bash
pnpm build
pnpm start        # runs against compiled files in dist/
```

In production mode, you will be prompted to choose the dataset difficulty before processing begins.

### Example Output

When running the analyzer, you'll see output similar to this:

```
✓ Choose difficulty level: hard

Here is the TOP 10 artists:

1. "The Strokes" with 96530 appearances
2. "The Goo Goo Dolls" with 96441 appearances
3. "Editors" with 96375 appearances
4. "Evanescence" with 96371 appearances
5. "MGMT" with 96336 appearances
6. "Linkin Park" with 96248 appearances
7. "The Killers" with 96244 appearances
8. "The Kooks" with 96227 appearances
9. "Florence + The Machine" with 96218 appearances
10. "Foo Fighters" with 96201 appearances

Time taken: 1 seconds and 696 milliseconds
```

## Configuration

Environment variables are loaded via `dotenv`. Supported variables:

| Name            | Default | Description                                 |
|-----------------|---------|---------------------------------------------|
| `TOP_K_ARTISTS` | `10`    | How many top artists to print after sorting |
| `NODE_ENV`      | —       | Use `production` to run the compiled build  |

You can place a `.env` file at the repository root to set these values.

## How It Works

### Execution Flow

1. **Initialization**: `src/main.ts` reads the selected difficulty level and discovers all `.jsonl.gz` files in the corresponding directory.

2. **Parallel Processing**: For each file, a worker thread is spawned:
   - Each worker (`src/workers/worker.ts`) receives a file path
   - Workers stream their assigned file using `countArtistAppearancesInFile`
   - Files are decompressed on-the-fly using `zlib.createGunzip`
   - Lines are parsed as JSON and artist counts are aggregated in chunks

3. **Chunked Aggregation**: 
   - Every 100,000 lines, workers send partial counts back to the main thread
   - This prevents memory buildup and enables incremental processing

4. **Top-K Maintenance**:
   - The main thread maintains a `MinHeap` with capacity `TOP_K_ARTISTS`
   - As counts arrive from workers, the heap is updated:
     - If an artist already exists, its count is updated
     - If the heap has space, new artists are added
     - If the heap is full, new artists replace the minimum only if they have higher counts
   - The heap ensures O(k) space complexity

5. **Result Display**: 
   - After all workers complete, the heap is converted to an array
   - Results are sorted by appearance count (descending)
   - Top K artists are displayed with timing information

### Key Algorithms

**Min-Heap Top-K Maintenance**:
- Maintains a heap of size K (not N)
- Root always contains the minimum count in the top K
- New items replace root only if they exceed the minimum
- Updates existing items in O(log k) time via index map

**Streaming File Processing**:
- Uses Node.js streams to process files without loading into memory
- Gzip decompression happens in the stream pipeline
- Line-by-line parsing with error handling for malformed JSON

**Worker Thread Communication**:
- Message passing for result chunks
- Error propagation from workers to main thread
- Promise-based coordination for worker completion

## Performance Characteristics

- **Time Complexity**: O(n log k) where n = total records, k = TOP_K_ARTISTS
- **Space Complexity**: O(k + w) where k = heap size, w = worker chunk size
- **Parallelism**: Processes files concurrently (limited by CPU cores)
- **Memory**: Constant memory usage regardless of dataset size (streaming)

## License

ISC
