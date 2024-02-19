bl_info = {
    # required
    'name': 'Vegas City RaceTrack Addon',
    'blender': (2, 80, 0),
    'category': 'Object',
    # optional
    'version': (1, 0, 0),
    'author': 'Karim Machlab',
    'description': 'Addon to assist in managing and exporting racetrack data.',
}

# imports
import bpy
import math
import mathutils
import re
import json

# define constants
rad_2_deg = 180 / math.pi

# define properties
PROPS = [
    (
        'track_name',
        bpy.props.StringProperty(
            name = 'Name',
            default = 'track_01',
            description='The export name for the race track.'
        )
    )
]

# class to handle the "export data" operation
class ExportDataOperator(bpy.types.Operator):
    
    # metadata
    bl_idname = 'opr.export_data_operator'
    bl_label = 'Export Data'
    
    # main method
    def execute(self, context):
        
        # construct an output filepath based on the current blender file
        filepath = bpy.data.filepath.split("\\")
        output_path = ""
        for i in range(len(filepath) - 2):
            output_path += filepath[i] + "\\"
        glb_path = "models/tracks/" + context.scene.track_name + ".glb"
        output_path += "Blender\\data\\" + context.scene.track_name + ".json"

        # Data to be written
        outputData = {
            "name": context.scene.track_name,
            "glb": glb_path,
            "track": [],
            "hotspots": [],
            "obstacles": [],
            "lapCheckpoints": []
        }

        # find hole we want to export
        for col in bpy.data.collections:
            
            # find the collection holding the track
            if (col.name.lower() == "track"):
                
                # grab and iterate the mesh objects in the collection
                sel_objs = [obj for obj in col.objects if obj.type == 'MESH']
                for obj in sel_objs:

                    trackData = {
                        "polygon": []
                    }

                    vertices = []
                    indices = []

                    # ensure mesh data is triangulated
                    mesh = obj.data
                    mesh.calc_loop_triangles()

                    # grab the vertices
                    index = 0
                    for vert in mesh.vertices:
                        co_final = obj.matrix_world @ vert.co
                        x = -co_final.x
                        y = co_final.z
                        z = -co_final.y
                        v = mathutils.Vector((x, y, z))

                        vertices.append(v)
                        indices.append(index)
                        index = index + 1

                    polygon = sort_radial_sweep(vertices, indices)
                    for p in polygon:
                        v = vertices[p]

                        trackData["polygon"].append({
                            "x": str(v.x),
                            "y": str(v.y),
                            "z": str(v.z)
                        })

                    outputData["track"].append(trackData)

            # find the collection holding the hotspots
            if (col.name.lower() == "hotspots"):
                
                # grab and iterate the mesh objects in the collection
                sel_objs = [obj for obj in col.objects if obj.type == 'MESH']
                for obj in sel_objs:

                    hotspotData = {
                        "hotspotType": "none",
                        "polygon": []
                    }

                    if "hotspotType" in obj:
                        hotspotData["hotspotType"] = str(obj["hotspotType"])

                    vertices = []
                    indices = []

                    # ensure mesh data is triangulated
                    mesh = obj.data
                    mesh.calc_loop_triangles()

                    # grab the vertices
                    index = 0
                    for vert in mesh.vertices:
                        co_final = obj.matrix_world @ vert.co
                        x = -co_final.x
                        y = co_final.z
                        z = -co_final.y
                        v = mathutils.Vector((x, y, z))

                        vertices.append(v)
                        indices.append(index)
                        index = index + 1

                    polygon = sort_radial_sweep(vertices, indices)
                    for p in polygon:
                        v = vertices[p]

                        hotspotData["polygon"].append({
                            "x": str(v.x),
                            "y": str(v.y),
                            "z": str(v.z)
                        })

                    outputData["hotspots"].append(hotspotData)
                        
            # find the collection holding the cannon data
            elif (col.name.lower() == "obstacles" or col.name.lower() == "boundary"):
                
                # grab and iterate the mesh objects in the collection
                sel_objs = [obj for obj in col.objects if obj.type == 'MESH']
                for obj in sel_objs:

                    obstacleData = {
                        "obstacleType": "none",
                        "shape": "",
                        "position": {
                            "x": 0,
                            "y": 0,
                            "z": 0
                        },
                        "rotation": {
                            "x": 0,
                            "y": 0,
                            "z": 0
                        },
                        "scale": {
                            "x": 0,
                            "y": 0,
                            "z": 0
                        }
                    }

                    if col.name.lower() == "boundary":
                        obstacleData["obstacleType"] = "boundary"
                    elif "obstacleType" in obj:
                        obstacleData["obstacleType"] = str(obj["obstacleType"])
                    
                    # grab the position
                    pos_x = -obj.location.x
                    pos_y = obj.location.z
                    pos_z = -obj.location.y
                    
                    # grab the rotation
                    rot_x = -obj.rotation_euler.x * rad_2_deg
                    rot_y = -obj.rotation_euler.z * rad_2_deg
                    rot_z = obj.rotation_euler.y * rad_2_deg

                    # grab the scale
                    sca_x = obj.scale.x
                    sca_y = obj.scale.z
                    sca_z = obj.scale.y
                    
                    # normalize the name
                    obj.name = re.sub(
                        "[^a-zA-Z0-9]",
                        "_",
                        obj.name
                    )
                    
                    obstacleData["shape"] = "box"
                    
                    # set origin to geometry
                    obj.select_set(state=True)
                    
                    context.view_layer.objects.active = obj
                    bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY')
                        
                    # check the vertices for edits - identify the bounds in local space
                    # NOTE : this won't necessarily handle well when edits other than moving faces along their normals have been made, making the shape no longer a AABB
                    min_x = 999
                    min_y = 999
                    min_z = 999
                    max_x = -999
                    max_y = -999
                    max_z = -999
                    for vert in obj.data.vertices:
                        if (vert.co.x < min_x):
                            min_x = vert.co.x
                        if (vert.co.x > max_x):
                            max_x = vert.co.x
                        if (vert.co.y < min_y):
                            min_y = vert.co.y
                        if (vert.co.y > max_y):
                            max_y = vert.co.y
                        if (vert.co.z < min_z):
                            min_z = vert.co.z
                        if (vert.co.z > max_z):
                            max_z = vert.co.z
                        
                    # work out the overall size, when combined with object scale
                    sca_x *= (max_x - min_x)
                    sca_y *= (max_z - min_z)
                    sca_z *= (max_y - min_y)
                        
                    obstacleData["position"]["x"] = str(pos_x)
                    obstacleData["position"]["y"] = str(pos_y)
                    obstacleData["position"]["z"] = str(pos_z)
                        
                    obstacleData["rotation"]["x"] = str(rot_x)
                    obstacleData["rotation"]["y"] = str(rot_y)
                    obstacleData["rotation"]["z"] = str(rot_z)
                        
                    obstacleData["scale"]["x"] = str(sca_x)
                    obstacleData["scale"]["y"] = str(sca_y)
                    obstacleData["scale"]["z"] = str(sca_z)
                    
                    outputData["obstacles"].append(obstacleData)

            # find the collection holding the lap checkpoints
            elif (col.name.lower() == "lap"):
                
                # grab and iterate the mesh objects in the collection
                sel_objs = [obj for obj in col.objects if obj.type == 'MESH']
                for obj in sel_objs:

                    checkpointData = {
                        "index": 0,
                        "position": {
                            "x": "0",
                            "y": "0",
                            "z": "0"
                        }
                    }

                    if "index" in obj:
                        checkpointData["index"] = obj["index"]

                    # grab the position
                    pos_x = -obj.location.x
                    pos_y = obj.location.z
                    pos_z = -obj.location.y

                    checkpointData["position"] = {
                        "x": str(pos_x),
                        "y": str(pos_y),
                        "z": str(pos_z)
                    }

                    outputData["lapCheckpoints"].append(checkpointData)

        # write to the file
        print("EXPORTING DATA")
        print(output_path)
        self.report({'INFO'}, "Exported data to " + output_path)

        with open(bpy.path.abspath(output_path), 'w') as f:
            f.write(json.dumps(outputData, indent=4, sort_keys=True))
                
        # report success
        return {'FINISHED'}
        
# class to handle the "export glb" operation
class ExportGLBOperator(bpy.types.Operator):
    
    # metadata
    bl_idname = 'opr.export_glb_operator'
    bl_label = 'Export GLB'
    
    # main method
    def execute(self, context):
        export_glb(self, context, "glb")
        export_glb(self, context, "avatar_colliders")

        # report success
        return {'FINISHED'}
    
# class to handle custom tool panel
class RaceTrackPanel(bpy.types.Panel):
    
    # define panel data
    bl_idname = 'VIEW3D_PT_race_track'
    bl_label = 'Race Track'
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    
    # method to draw the panel ui
    def draw(self, context):

        # display fields for properties
        col = self.layout.column()
        for (prop_name, _) in PROPS:
            row = col.row()
            row.prop(context.scene, prop_name)
            
        # export data button
        col.operator('opr.export_data_operator', text='Export Data')

        # export glb button
        col.operator('opr.export_glb_operator', text='Export GLB')
        
# build a list of all custom tool panels
CLASSES = [
    RaceTrackPanel,
    ExportDataOperator,
    ExportGLBOperator
]

# method to register all custom tool panels
def register():

    # register properies
    for (prop_name, prop_value) in PROPS:
        setattr(bpy.types.Scene, prop_name, prop_value)
        
    # register classes
    for klass in CLASSES:
        bpy.utils.register_class(klass)
        
# method to unregister all custom tool panels
def unregister():

    # unregister properies
    for (prop_name, _) in PROPS:
        delattr(bpy.types.Scene, prop_name)

    # unregister classes
    for klass in CLASSES:
        bpy.utils.unregister_class(klass)

# register all custom tool panels automatically as long as we're not just a dependency        
if __name__ == '__main__':
    register()

def export_glb(self, context, col):
    # find the glb collection and make it active
    has_collection = False
    for layer_collection in context.view_layer.layer_collection.children:
        if (layer_collection.name.lower() == col):
            context.view_layer.active_layer_collection = layer_collection
            has_collection = True
    if not has_collection:
        print("No GLB collection could be found to export")
        self.report({'ERROR'}, "No GLB collection could be found to export")
        
    # construct an output filepath based on the current blender file
    filepath = bpy.data.filepath.split("\\")
    output_path = ""
    for i in range(len(filepath) - 2):
        output_path += filepath[i] + "\\"
    output_path += "Blender\\models\\tracks\\"
    
    # construct the filename
    filename = context.scene.track_name
    if (col == "avatar_colliders"):
        filename += "_collider"

    output_path += filename + ".glb"
    
    # export the glb collection as the visual mesh and avatar collider
    print("EXPORTING GLB")
    print(output_path)
    self.report({'INFO'}, "Exported GLB to " + output_path)
    bpy.ops.export_scene.gltf(
        filepath = output_path,
        check_existing = False,
        export_format = "GLB",
        export_apply = True,
        export_cameras = False,
        use_selection = False,
        use_visible = False,
        use_renderable = False,
        use_active_collection = True,
        will_save_settings = False
    )

def sort_radial_sweep(vs, indices):
    """
    Given a list of vertex positions (vs) and indices
    for verts making up a circular-ish planar polygon,
    returns the vertex indices in order around that poly.
    """
    assert len(vs) >= 3
    
    # Centroid of verts
    cent = mathutils.Vector()
    for v in vs:
        cent += (1/len(vs)) * v

    # Normalized vector from centroid to first vertex
    # ASSUMES: vs[0] is not located at the centroid
    r0 = (vs[0] - cent).normalized()

    # Normal to plane of poly
    # ASSUMES: cent, vs[0], and vs[1] are not colinear
    nor = (vs[1] - cent).cross(r0).normalized()

    # Pairs of (vertex index, angle to centroid)
    vpairs = []
    for vi, vpos in zip(indices, vs):
        r1 = (vpos - cent).normalized()
        dot = r1.dot(r0)
        angle = math.acos(max(min(dot, 1), -1))
        angle *= 1 if nor.dot(r1.cross(r0)) >= 0 else -1    
        vpairs.append((vi, angle))
    
    # Sort by angle and return indices
    vpairs.sort(key=lambda v: v[1])
    return [vi for vi, angle in vpairs]