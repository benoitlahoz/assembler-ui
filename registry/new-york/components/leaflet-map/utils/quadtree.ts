/**
 * Quadtree spatial index for efficient feature lookup
 * Allows O(log n) queries for features within a bounding box
 */

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface QuadtreeItem<T = any> {
  id: string | number;
  lat: number;
  lng: number;
  data: T;
}

export class Quadtree<T = any> {
  private bounds: Bounds;
  private capacity: number;
  private items: QuadtreeItem<T>[] = [];
  private divided = false;
  private northeast?: Quadtree<T>;
  private northwest?: Quadtree<T>;
  private southeast?: Quadtree<T>;
  private southwest?: Quadtree<T>;

  constructor(bounds: Bounds, capacity = 4) {
    this.bounds = bounds;
    this.capacity = capacity;
  }

  /**
   * Insert an item into the quadtree
   */
  insert(item: QuadtreeItem<T>): boolean {
    // Check if point is within bounds
    if (!this.contains(item.lat, item.lng)) {
      return false;
    }

    // If there's space and not divided, add it here
    if (this.items.length < this.capacity && !this.divided) {
      this.items.push(item);
      return true;
    }

    // Subdivide if needed
    if (!this.divided) {
      this.subdivide();
    }

    // Try to insert in children
    if (this.northeast!.insert(item)) return true;
    if (this.northwest!.insert(item)) return true;
    if (this.southeast!.insert(item)) return true;
    if (this.southwest!.insert(item)) return true;

    return false;
  }

  /**
   * Query all items within a bounding box
   */
  query(bounds: Bounds, found: QuadtreeItem<T>[] = []): QuadtreeItem<T>[] {
    // Check if this quadtree intersects with the query bounds
    if (!this.intersects(bounds)) {
      return found;
    }

    // Add items from this node that are within bounds
    for (const item of this.items) {
      if (this.containsInBounds(item.lat, item.lng, bounds)) {
        found.push(item);
      }
    }

    // Query children if divided
    if (this.divided) {
      this.northeast!.query(bounds, found);
      this.northwest!.query(bounds, found);
      this.southeast!.query(bounds, found);
      this.southwest!.query(bounds, found);
    }

    return found;
  }

  /**
   * Subdivide this quadtree into 4 children
   */
  private subdivide(): void {
    const { north, south, east, west } = this.bounds;
    const midLat = (north + south) / 2;
    const midLng = (east + west) / 2;

    this.northeast = new Quadtree({ north, south: midLat, east, west: midLng }, this.capacity);
    this.northwest = new Quadtree({ north, south: midLat, east: midLng, west }, this.capacity);
    this.southeast = new Quadtree({ north: midLat, south, east, west: midLng }, this.capacity);
    this.southwest = new Quadtree({ north: midLat, south, east: midLng, west }, this.capacity);

    this.divided = true;

    // Redistribute existing items to children
    const itemsToRedistribute = [...this.items];
    this.items = [];

    for (const item of itemsToRedistribute) {
      this.northeast.insert(item) ||
        this.northwest.insert(item) ||
        this.southeast.insert(item) ||
        this.southwest.insert(item);
    }
  }

  /**
   * Check if a point is within this quadtree's bounds
   */
  private contains(lat: number, lng: number): boolean {
    return (
      lat >= this.bounds.south &&
      lat <= this.bounds.north &&
      lng >= this.bounds.west &&
      lng <= this.bounds.east
    );
  }

  /**
   * Check if a point is within given bounds
   */
  private containsInBounds(lat: number, lng: number, bounds: Bounds): boolean {
    return lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east;
  }

  /**
   * Check if this quadtree intersects with given bounds
   */
  private intersects(bounds: Bounds): boolean {
    return !(
      bounds.west > this.bounds.east ||
      bounds.east < this.bounds.west ||
      bounds.north < this.bounds.south ||
      bounds.south > this.bounds.north
    );
  }

  /**
   * Get total number of items in tree (including children)
   */
  size(): number {
    let count = this.items.length;
    if (this.divided) {
      count += this.northeast!.size();
      count += this.northwest!.size();
      count += this.southeast!.size();
      count += this.southwest!.size();
    }
    return count;
  }

  /**
   * Clear the quadtree
   */
  clear(): void {
    this.items = [];
    this.divided = false;
    this.northeast = undefined;
    this.northwest = undefined;
    this.southeast = undefined;
    this.southwest = undefined;
  }
}
